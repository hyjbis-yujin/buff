/**
 * 인기 순위 우선순위 및 카테고리 설정 (Soft Cap 방식)
 */
const RANKING_CONFIG = {
  // 우선순위 리스트 (상단 노출 기준)
  PRIORITY: ['koreanLatestDrama', 'koreanVariety', 'globalDrama', 'movie', 'animation'],
  
  // 카테고리별 상세 정의 및 Soft Cap (권장 최대 노출 수)
  CATEGORIES: {
    koreanLatestDrama: { 
      label: "한국 최신 드라마", 
      type: 'tv', lang: 'ko', genreIds: [18], 
      isLatest: true, softCap: 6 
    },
    koreanVariety: { 
      label: "한국 인기 예능", 
      type: 'tv', lang: 'ko', genreIds: [10764, 10767], 
      softCap: 5 
    },
    globalDrama: { 
      label: "해외 인기 드라마", 
      type: 'tv', lang: 'not_ko', genreIds: [18], 
      softCap: 3 
    },
    movie: { 
      label: "영화", 
      type: 'movie', genreNot: [16], 
      softCap: 3 
    },
    animation: { 
      label: "애니메이션", 
      genreIds: [16], 
      softCap: 2 
    }
  },
  
  // 최신성 판단 기준 (개월)
  LATEST_MONTHS: 24,
  TOTAL_SLOTS: 10
};

/**
 * 유튜브 필터링 및 수집 정책
 */
const YOUTUBE_CONFIG = {
  MIN_DURATION_SECONDS: 180, 
  MAX_VIDEOS_PER_CHANNEL: 4,  // 채널당 노출 한도 확대
  SEARCH_DEPTH: 25,          // 검색 결과 조회 수 확대
  TOTAL_RESULT_COUNT: 30,     // 최종 노출 영상 수 확대
  BLACKLIST_KEYWORDS: ['shorts', 'teaser', '예고편', '티저', 'live', '라이브', '힌트캠', '선공개', 'Shorts'],
  
  CHANNELS: [
    { name: "뜬뜬 DdeunDdeun", id: "UCDNvRZRgvkBTUkQzFoT_8rA" },
    { name: "채널십오야", id: "UCQ2O-iftmnlfrBuNsUUTofQ" },
    { name: "TEO 테오", id: "UC-uIpGINZDL-VIHQQzJW8jw" },
    { name: "요정재형", id: "UCN5XdqTDRbyjXPF5NXUqWdA" },
    { name: "디글 : Diggle", id: "UC0U7XhC0p4UoV1pD-h_t1vA" },
    { name: "피식대학Psick Univ", id: "UCmSy4S3_x3YnZ_X8O6g5u_A" },
    { name: "빠더너스 BDNS", id: "UCf98Mv0z6Z5Z-5_vN0Y6X_A" },
    { name: "문명특급 - MMTG", id: "UC9p_G_Siz9V5hO_S6m-p0Sg" },
    { name: "스튜디오 와플 - STUDIO WAFFL", id: "UC_mG-WpBAs6mC6l_2_O6kHg" }
  ]
};

module.exports = {
  RANKING_CONFIG,
  YOUTUBE_CONFIG,
  // 하위 호환성을 위해 기존 이름 유지
  RANKING_MIX_RULES: { default: { tv: 7, movie: 3 } }
};
