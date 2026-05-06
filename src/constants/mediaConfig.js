/**
 * Media Ranking & YouTube Collection Configuration
 */
export const RANKING_CONFIG = {
  PRIORITY: ['koreanLatestDrama', 'koreanVariety', 'globalDrama', 'movie', 'animation'],
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
  LATEST_MONTHS: 24,
  TOTAL_SLOTS: 10
};

export const YOUTUBE_CONFIG = {
  MIN_DURATION_SECONDS: 180, 
  MAX_VIDEOS_PER_CHANNEL: 4,
  SEARCH_DEPTH: 25,
  TOTAL_RESULT_COUNT: 30,
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
