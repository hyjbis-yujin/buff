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
async function fetchRankingsByProvider(providerId, providerKey) {
  console.log(`[Fetch] '${providerKey}'(ID: ${providerId}) 데이터 수집 중...`);
  
  try {
    // TV와 Movie 각각 인기순 20개씩 호출 (플랫폼별 트렌드이므로 언어 필터 해제)
    const [tvRes, movieRes] = await Promise.all([
      fetchTMDB(`/discover/tv?language=ko-KR&sort_by=popularity.desc&watch_region=KR&with_watch_providers=${providerId}`, API_KEY),
      fetchTMDB(`/discover/movie?language=ko-KR&sort_by=popularity.desc&watch_region=KR&with_watch_providers=${providerId}`, API_KEY)
    ]);

    const tvItems = (tvRes.results || []).map(item => ({
      id: item.id.toString(),
      title: item.name,
      mediaType: 'tv',
      image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      genreIds: item.genre_ids || [],
      tags: getTagsFromGenreIds(item.genre_ids),
      popularity: item.popularity || 0,
      originalLanguage: item.original_language
    }));

    const movieItems = (movieRes.results || []).map(item => ({
      id: item.id.toString(),
      title: item.title,
      mediaType: 'movie',
      image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      genreIds: item.genre_ids || [],
      tags: getTagsFromGenreIds(item.genre_ids),
      popularity: item.popularity || 0,
      originalLanguage: item.original_language
    }));

    const rawItems = [...tvItems, ...movieItems].filter(item => item.image);

    // [New] 개별 아이템의 모든 Provider 정보 수집
    const enrichedItems = (await Promise.all(rawItems.map(async (item) => {
      try {
        const provData = await fetchTMDB(`/${item.mediaType}/${item.id}/watch/providers`, API_KEY);
        const providers = getValidKRProviders(provData);
        
        // KR 유효 Provider가 없으면 제외 대상 (null 반환 후 필터링)
        if (providers.length === 0) return null;
        
        return { ...item, providers };
      } catch (e) {
        return null;
      }
    }))).filter(Boolean);

    // 병합 및 정렬 (1순위: 한국 콘텐츠 우선, 2순위: 인기순)
    const sorted = enrichedItems
      .sort((a, b) => {
        if (a.originalLanguage === 'ko' && b.originalLanguage !== 'ko') return -1;
        if (a.originalLanguage !== 'ko' && b.originalLanguage === 'ko') return 1;
        return b.popularity - a.popularity;
      })
      .slice(0, 10);

    return sorted;
  } catch (err) {
    console.error(`❌ '${providerKey}' 수집 중 에러 발생:`, err.message);
    return null;
  }
}

async function runPipeline() {
  console.log("=========================================");
  console.log("🚀 TMDB 오늘의 인기 콘텐츠 파이프라인 시작");
  console.log("=========================================\n");

  const existingData = getExistingData();
  const finalData = {};
  const platformCounts = {};
  let successCount = 0;

  const platforms = Object.entries(PROVIDER_MAP); // [[8, 'netflix'], ...]

  for (const [id, key] of platforms) {
    const freshItems = await fetchRankingsByProvider(id, key);
    
    // 검증: 5개 이상 수집 성공 시에만 최신 데이터로 인정
    if (freshItems && freshItems.length >= 5) {
      finalData[key] = freshItems;
      platformCounts[key] = freshItems.length;
      successCount++;
    } else {
      // 폴백: 기존 데이터가 있으면 재사용
      if (existingData && existingData.data && existingData.data[key]) {
        console.log(`⚠️ '${key}' 데이터 부족/실패 -> 기존 데이터 유지(Fallback)`);
        finalData[key] = existingData.data[key];
        platformCounts[key] = finalData[key].length;
      } else {
        console.log(`⚠️ '${key}' 데이터 부족 및 폴백 데이터 없음 -> 빈 배열 처리`);
        finalData[key] = [];
        platformCounts[key] = 0;
      }
    }
  }

  // 최종 판단 (Majority Rule: 5개 플랫폼 중 3개 이상 정상 수집 시 파일 쓰기)
  const isHealthy = successCount >= 3 || (existingData && Object.keys(finalData).length === platforms.length);

  if (isHealthy) {
    const finalJSON = {
      code: 200,
      status: "success",
      message: "success",
      meta: {
        updatedAt: new Date().toISOString(),
        region: "KR",
        platformCounts
      },
      data: finalData
    };

    fs.writeFileSync(OUT_PATH, JSON.stringify(finalJSON, null, 2), 'utf8');
    console.log(`\n[Phase 4] 💾 성공적으로 갱신되었습니다.\n>> PATH: ${OUT_PATH}`);
    console.log(`>> 업데이트 성공 플랫폼: ${successCount} / ${platforms.length}`);
  } else {
    console.error(`\n❌ [Fatal Error] 정상 수집된 플랫폼이 너무 적어(${successCount}개) 업데이트를 중단합니다.`);
    process.exit(1);
  }
}

runPipeline();
