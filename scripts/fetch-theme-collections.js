const fs = require('fs');
const path = require('path');
const { loadEnv, fetchTMDB, getTagsFromGenreIds, getValidKRProviders } = require('./shared-utils');

// 1. 환경 변수 로드
loadEnv();
const API_KEY = process.env.TMDB_API_KEY; 
if (!API_KEY) {
  console.error("❌ ERROR: TMDB_API_KEY가 존재하지 않습니다.");
  process.exit(1);
}

/**
 * 2. 가상 큐레이션 테마 설정
 */
const THEMES = [
  {
    id: "theme-summer",
    title: "🌿 여름 정주행 모음집 🌿",
    author: "BUFF 큐레이션 팀",
    query: "/discover/tv?language=ko-KR&with_original_language=ko&sort_by=vote_count.desc&with_genres=35,10751",
    themeKey: "summer"
  },
  {
    id: "theme-action",
    title: "🎬 액션 쾌감! 실패 없는 정주행 리스트",
    author: "BUFF 정주행러",
    query: "/discover/movie?language=ko-KR&with_original_language=ko&sort_by=popularity.desc&with_genres=28,80",
    themeKey: "action"
  },
  {
    id: "theme-thriller",
    title: "👁️ 미스터리/스릴러 매니아 모임",
    author: "밤샘전문가",
    query: "/discover/tv?language=ko-KR&with_original_language=ko&sort_by=popularity.desc&with_genres=9648,80",
    themeKey: "thriller"
  },
  {
    id: "theme-romance",
    title: "💖 설렘 주의보! 로맨틱 성장 드라마",
    author: "BUFF 감성관",
    query: "/discover/tv?language=ko-KR&with_original_language=ko&sort_by=popularity.desc&with_genres=10749,18",
    themeKey: "romance"
  },
  {
    id: "theme-classic",
    title: "⭐ 다시 봐도 명작인 인생 드라마",
    author: "드라마콜렉터",
    query: "/discover/tv?language=ko-KR&with_original_language=ko&sort_by=vote_average.desc&vote_count.gte=500",
    themeKey: "classic"
  },
  {
    id: "theme-sf",
    title: "🚀 무한한 우주, SF 판타지 정주행",
    author: "우주여행자",
    query: "/discover/movie?language=ko-KR&with_original_language=ko&sort_by=popularity.desc&with_genres=878,14",
    themeKey: "sf"
  },
  {
    id: "theme-horror",
    title: "👻 등골 오싹! 여름밤의 공포 스릴러",
    author: "BUFF 공포관",
    query: "/discover/movie?language=ko-KR&with_original_language=ko&sort_by=popularity.desc&with_genres=27,53",
    themeKey: "horror"
  },
  {
    id: "theme-healing",
    title: "🌱 지친 하루를 달래줄 힐링 영화",
    author: "마음세탁소",
    query: "/discover/movie?language=ko-KR&with_original_language=ko&sort_by=popularity.desc&with_genres=18,35&without_genres=28,27,80",
    themeKey: "healing"
  },
  {
    id: "theme-animation",
    title: "🎨 어른이들을 위한 감성 애니메이션",
    author: "애니메이터",
    query: "/discover/movie?language=ko-KR&with_original_language=ko&sort_by=popularity.desc&with_genres=16,10751",
    themeKey: "animation"
  },
  {
    id: "theme-mystery",
    title: "🧐 범인은 이 안에 있어! 정통 추리극",
    author: "탐정지망생",
    query: "/discover/tv?language=ko-KR&with_original_language=ko&sort_by=popularity.desc&with_genres=9648,80",
    themeKey: "mystery"
  }
];

async function fetchThemeCollectionData() {
  console.log("=========================================");
  console.log("🚀 테마 컬렉션 데이터 수집 시작");
  console.log("=========================================\n");

  try {
    const collections = [];

    for (const theme of THEMES) {
      console.log(`[Theme] '${theme.title}' 수집 중...`);
      
      // [Updated] 더 많은 카드 확보를 위해 2페이지 분량 수집
      const page1 = await fetchTMDB(`${theme.query}&page=1`, API_KEY);
      const page2 = await fetchTMDB(`${theme.query}&page=2`, API_KEY);
      const results = [...(page1.results || []), ...(page2.results || [])];
      
      // 개별 아이템 상세 정보 추출 (id, mediaType, image)
      const mediaType = theme.query.includes('/tv') ? 'tv' : 'movie';
      const rawItems = results
        .filter(item => item.poster_path)
        .slice(0, 60); // 필터링 대비 풀 확대 (한 테마당 최대 60개 목표)

      // [New] 개별 아이템 상세 정보 및 Provider 수집
      const items = (await Promise.all(rawItems.map(async (item) => {
        try {
          const provData = await fetchTMDB(`/${mediaType}/${item.id}/watch/providers`, API_KEY);
          const providers = getValidKRProviders(provData);

          // 한국 내 유효 Provider가 없으면 아예 제외 (null 반환 후 필터링)
          if (providers.length === 0) return null;

          return {
            id: item.id.toString(),
            title: item.title || item.name,
            mediaType: mediaType,
            image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            tags: getTagsFromGenreIds(item.genre_ids),
            providers: providers
          };
        } catch (e) {
          return null; // 에러 발생 시 제외
        }
      }))).filter(Boolean);

      if (items.length >= 4) {
        collections.push({
          id: theme.id,
          title: theme.title,
          author: theme.author,
          items: items, 
          theme: theme.themeKey,
          authorType: theme.author.includes('BUFF') ? 'official' : 'user',
          updatedAt: new Date().toISOString()
        });
      }
    }

    if (collections.length < 3) {
      throw new Error("수집된 테마 카드가 너무 적습니다. 업데이트를 중단합니다.");
    }

    const finalJSON = {
      code: 200,
      status: "success",
      message: "success",
      meta: {
        updatedAt: new Date().toISOString(),
        totalCount: collections.length
      },
      data: {
        list: collections
      }
    };

    const outPath = path.resolve(__dirname, '../public/data/theme-collections.json');
    fs.writeFileSync(outPath, JSON.stringify(finalJSON, null, 2), 'utf8');
    
    console.log(`\n[Phase 4] 💾 성공적으로 저장되었습니다.\n>> PATH: ${outPath}`);

  } catch (err) {
    console.error("\n💥 [테마 컬렉션 수집 파이프라인 셧다운]");
    console.error("이유: " + err.message);
    process.exit(1);
  }
}

fetchThemeCollectionData();
