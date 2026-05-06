const fs = require('fs');
const path = require('path');
const { loadEnv, PROVIDER_MAP, fetchTMDB, getTagsFromGenreIds, getValidKRProviders } = require('./shared-utils');

// 1. 환경 변수 로드
loadEnv();

const API_KEY = process.env.TMDB_API_KEY;
if (!API_KEY) {
  console.error("❌ ERROR: TMDB_API_KEY가 존재하지 않습니다. 스크립트를 중단합니다.");
  process.exit(1);
}

const OUT_PATH = path.resolve(__dirname, '../public/data/rankings.json');

/**
 * 기존 데이터 로드 (폴백용)
 */
function getExistingData() {
  try {
    if (fs.existsSync(OUT_PATH)) {
      return JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
    }
  } catch (e) {
    console.error("⚠️ 기존 rankings.json 로드 실패, 새로 생성합니다.");
  }
  return null;
}

/**
 * 플랫폼별 데이터 수집 로직
 */
async function fetchRankingsByProvider(providerId, providerKey, globalKOPools) {
  console.log(`[Fetch] '${providerKey}'(ID: ${providerId}) 데이터 수집 중...`);
  
  try {
    const { RANKING_CONFIG } = require('./lib/config');

    // 1. 플랫폼별 인기 순위 후보군 수집 (대표작 확보를 위해 5페이지까지 확대)
    const pageIndices = [1, 2, 3, 4, 5];
    const tvResponses = await Promise.all(pageIndices.map(p => 
      fetchTMDB(`/discover/tv?language=ko-KR&sort_by=popularity.desc&watch_region=KR&with_watch_providers=${providerId}&page=${p}&include_adult=false`, API_KEY)
    ));
    const movieResponses = await Promise.all(pageIndices.map(p => 
      fetchTMDB(`/discover/movie?language=ko-KR&sort_by=popularity.desc&watch_region=KR&with_watch_providers=${providerId}&page=${p}&include_adult=false`, API_KEY)
    ));

    const tvResults = tvResponses.flatMap(res => res.results || []);
    const movieResults = movieResponses.flatMap(res => res.results || []);

    // 2. 데이터 매핑 및 통합
    const tvItems = tvResults.map(item => ({ ...item, mediaType: 'tv' }));
    const movieItems = movieResults.map(item => ({ ...item, mediaType: 'movie' }));
    
    // 전역 최신/인기 한국 콘텐츠 풀과 통합
    const combinedPool = [...tvItems, ...movieItems, ...globalKOPools];
    
    // 3. 중복 제거 및 필터링 (Adult 필터 강화)
    const uniqueItemsMap = new Map();
    combinedPool.forEach(item => {
      if (item.poster_path && !uniqueItemsMap.has(item.id)) {
        uniqueItemsMap.set(item.id, item);
      }
    });

    const candidateItems = Array.from(uniqueItemsMap.values());
    console.log(`  [Candidates] 통합 후보군 ${candidateItems.length}개 분석 시작...`);

    const enrichedItems = (await Promise.all(candidateItems.map(async (item) => {
      try {
        // 상세 정보 조회를 통해 Provider 및 성인물 여부 재확인
        const details = await fetchTMDB(`/${item.mediaType}/${item.id}?language=ko-KR&append_to_response=watch/providers`, API_KEY);
        
        // 성인물 필터링 (flag 및 특정 키워드/장르 조합)
        if (details.adult) return null;
        
        // 인기도는 높은데 투표수가 너무 적은 의심스러운 콘텐츠 제외 (성인물/노이즈 방지)
        if (details.popularity > 50 && (details.vote_count || 0) < 3) return null;

        const providers = getValidKRProviders(details['watch/providers']);
        const isOnThisPlatform = providers.some(p => p.id === parseInt(providerId));
        if (!isOnThisPlatform) return null;

        const category = getCategory(details, item.mediaType);
        
        return {
          id: item.id.toString(),
          title: details.name || details.title || item.name || item.title,
          mediaType: item.mediaType,
          category,
          image: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
          genreIds: details.genres?.map(g => g.id) || item.genre_ids || [],
          tags: getTagsFromGenreIds(details.genres?.map(g => g.id) || item.genre_ids),
          popularity: details.popularity || item.popularity || 0,
          originalLanguage: details.original_language || item.original_language,
          releaseDate: details.first_air_date || details.release_date || '0000-00-00',
          providers
        };
      } catch (e) { return null; }
    }))).filter(Boolean);

    // 카테고리별 버킷팅
    const buckets = {};
    RANKING_CONFIG.PRIORITY.forEach(cat => buckets[cat] = []);
    buckets['others'] = [];

    enrichedItems.forEach(item => {
      if (buckets[item.category]) buckets[item.category].push(item);
      else buckets['others'].push(item);
    });

    console.log(`  [Buckets] ${Object.entries(buckets).map(([k, v]) => `${k}: ${v.length}`).join(', ')}`);

    // 정렬 규칙 (티빙/웨이브 등 로컬 플랫폼은 최신성 + 한국 콘텐츠 가중치)
    const dateSortFn = (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate);
    const popSortFn = (a, b) => b.popularity - a.popularity;

    Object.keys(buckets).forEach(cat => {
      if (cat === 'koreanLatestDrama' || cat === 'koreanVariety') buckets[cat].sort(dateSortFn);
      else buckets[cat].sort(popSortFn);
    });

    // 최종 슬롯 채우기
    const selectedItems = [];
    const usedIds = new Set();

    for (const catName of RANKING_CONFIG.PRIORITY) {
      const bucket = buckets[catName];
      const cap = RANKING_CONFIG.CATEGORIES[catName]?.softCap || 0;
      const toTake = bucket.splice(0, Math.min(bucket.length, cap));
      toTake.forEach(item => {
        if (selectedItems.length < RANKING_CONFIG.TOTAL_SLOTS) {
          selectedItems.push(item);
          usedIds.add(item.id);
        }
      });
    }

    if (selectedItems.length < RANKING_CONFIG.TOTAL_SLOTS) {
      const residuals = [
        ...RANKING_CONFIG.PRIORITY.flatMap(cat => buckets[cat]),
        ...buckets['others']
      ].sort(popSortFn);

      for (const item of residuals) {
        if (selectedItems.length < RANKING_CONFIG.TOTAL_SLOTS && !usedIds.has(item.id)) {
          selectedItems.push(item);
          usedIds.add(item.id);
        }
      }
    }

    console.log(`  [Top 3 Config] ${selectedItems.slice(0, 3).map(i => `${i.title}(${i.category})`).join(', ')}`);
    return selectedItems;
  } catch (err) {
    console.error(`❌ '${providerKey}' 수집 중 에러 발생:`, err.message);
    return null;
  }
}

function getCategory(details, mediaType) {
  const genreIds = details.genres?.map(g => g.id) || [];
  const isAnimation = genreIds.includes(16);
  if (isAnimation) return 'animation';

  if (mediaType === 'tv') {
    const isVariety = genreIds.includes(10764) || genreIds.includes(10767);
    const isKorean = details.original_language === 'ko';
    if (isKorean) {
      return isVariety ? 'koreanVariety' : 'koreanLatestDrama';
    }
    return genreIds.includes(18) ? 'globalDrama' : 'others';
  }
  return 'movie';
}

/**
 * 전역 한국 콘텐츠 전략 후보군 수집 (최신작 + 대표 인기작)
 */
async function fetchGlobalKOPools() {
  console.log("[Phase 1] 🇰🇷 한국 대표작 및 최신작 통합 후보군 수집 중...");
  try {
    const today = new Date().toISOString().split('T')[0];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const startDate = sixMonthsAgo.toISOString().split('T')[0];

    // 1. 최신 한국 TV (최신순) - 수집 범위 확대 (3페이지)
    const latestResponses = await Promise.all([1, 2, 3].map(p => 
      fetchTMDB(`/discover/tv?with_original_language=ko&sort_by=first_air_date.desc&first_air_date.lte=${today}&first_air_date.gte=${startDate}&page=${p}&include_adult=false`, API_KEY)
    ));
    const latestItems = latestResponses.flatMap(res => res.results || []);
    
    // 2. 인기 한국 TV (인기순 - 대표작 확보용)
    const popularRes = await fetchTMDB(`/discover/tv?with_original_language=ko&sort_by=popularity.desc&page=1&include_adult=false`, API_KEY);

    // 3. 인기 한국 예능 (Variety 전용) - 수집 범위 확대 (2페이지)
    const varietyResponses = await Promise.all([1, 2].map(p =>
      fetchTMDB(`/discover/tv?with_original_language=ko&with_genres=10764,10767&sort_by=popularity.desc&page=${p}&include_adult=false`, API_KEY)
    ));
    const varietyItems = varietyResponses.flatMap(res => res.results || []);

    const merged = [
      ...latestItems,
      ...(popularRes.results || []),
      ...varietyItems
    ].map(i => ({ ...i, mediaType: 'tv' }));

    console.log(`  >> ${merged.length}개의 한국 콘텐츠 후보를 확보했습니다.\n`);
    return merged;
  } catch (e) {
    console.error("❌ 후보군 수집 실패:", e.message);
    return [];
  }
}

async function runPipeline() {
  console.log("=========================================");
  console.log("🚀 TMDB 오늘의 인기 콘텐츠 파이프라인 시작");
  console.log("=========================================\n");

  const globalKOPools = await fetchGlobalKOPools();
  const existingData = getExistingData();
  const finalData = {};
  const platformCounts = {};
  let successCount = 0;

  const platforms = Object.entries(PROVIDER_MAP);

  for (const [id, key] of platforms) {
    const freshItems = await fetchRankingsByProvider(id, key, globalKOPools);
    
    if (freshItems && freshItems.length >= 5) {
      finalData[key] = freshItems;
      platformCounts[key] = freshItems.length;
      successCount++;
    } else {
      if (existingData && existingData.data && existingData.data[key]) {
        console.log(`⚠️ '${key}' 데이터 부족/실패 -> 기존 데이터 유지(Fallback)`);
        finalData[key] = existingData.data[key];
        platformCounts[key] = finalData[key].length;
      } else {
        finalData[key] = [];
        platformCounts[key] = 0;
      }
    }
  }

  const isHealthy = successCount >= 3 || (existingData && Object.keys(finalData).length === platforms.length);

  if (isHealthy) {
    const finalJSON = {
      code: 200, status: "success", message: "success",
      meta: { updatedAt: new Date().toISOString(), region: "KR", platformCounts },
      data: finalData
    };
    fs.writeFileSync(OUT_PATH, JSON.stringify(finalJSON, null, 2), 'utf8');
    console.log(`\n[Phase 4] 💾 성공적으로 갱신되었습니다.\n>> PATH: ${OUT_PATH}`);
  } else {
    console.error(`\n❌ [Fatal Error] 업데이트 중단.`);
    process.exit(1);
  }
}

runPipeline();
