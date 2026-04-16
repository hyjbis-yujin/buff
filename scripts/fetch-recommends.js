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

/**
 * 큐레이션 동적 날짜 계산 (최근 12개월로 확장)
 */
const getTwelveMonthsAgoDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split('T')[0];
};

async function fetchRecommendations() {
  console.log("=========================================");
  console.log("🚀 TMDB API 추천작 수집 파이프라인 시작");
  console.log("=========================================\n");

  try {
    const dateParam = getTwelveMonthsAgoDate();
    console.log(`[Phase 1] 📅 검색 큐레이션 기준: ${dateParam} 이후 방영된 한국 콘텐츠\n`);

    // TMDB Discover API 호출
    const endpoint = `/discover/tv?language=ko-KR&with_original_language=ko&sort_by=vote_average.desc&vote_count.gte=30&first_air_date.gte=${dateParam}`;
    const data = await fetchTMDB(endpoint, API_KEY);
    
    let rawItems = data.results || [];

    // 스크립트단 2차 필터링
    rawItems = rawItems.filter(item => item.popularity >= 5 && item.vote_average >= 6.5);
    rawItems = rawItems.slice(0, 15);

    console.log(`[Phase 2] 🔍 1차 필터링 완료 아이템 수: ${rawItems.length}개\n`);
    
    const normalizedItems = [];

    for (const item of rawItems) {
      if (!item.poster_path || !item.name) continue;

      // Provider API 호출
      const provData = await fetchTMDB(`/tv/${item.id}/watch/providers`, API_KEY);
      
      // Provider 상세 데이터 (랭킹과 동일한 규격)
      const providers = getValidKRProviders(provData);

      if (providers.length === 0) continue;

      // 장르 매핑
      const tags = getTagsFromGenreIds(item.genre_ids);

      normalizedItems.push({
        contentId: item.id.toString(),
        tmdbId: item.id,
        mediaType: 'tv', 
        title: item.name, // titleName 대신 title로 통일 (매퍼에서 보정 예정)
        synopsis: item.overview || "추천 콘텐츠의 상세 정보가 곧 공식 업데이트될 예정입니다.",
        posterUrl: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
        backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        tags: tags, // keywords 대신 tags로 통일
        providers: providers
      });
    }

    console.log(`[Phase 3] ✅ 모든 필터 체인 통과 완료 아이템: ${normalizedItems.length}개\n`);

    if (normalizedItems.length < 3) {
      throw new Error(`[Fatal Error] 수집된 데이터가 ${normalizedItems.length}개로, 최소 요구치 미달입니다.`);
    }

    const finalJSON = {
      code: 200,
      status: "success",
      message: "success",
      meta: {
        updatedAt: new Date().toISOString(),
        theme: "최근 12개월 완성도 높은 K-콘텐츠",
        totalCount: normalizedItems.length
      },
      data: {
        list: normalizedItems
      }
    };

    const outPath = path.resolve(__dirname, '../public/data/recommends.json');
    fs.writeFileSync(outPath, JSON.stringify(finalJSON, null, 2), 'utf8');
    
    console.log(`[Phase 4] 💾 성공적으로 갱신되었습니다.\n>> PATH: ${outPath}\n`);
    
  } catch (err) {
    console.error("\n💥 [데이터 수집 파이프라인 셧다운]");
    console.error("이유: " + (err.message || err));
    process.exit(1);
  }
}

fetchRecommendations();
