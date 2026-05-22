export const SLIDER_PRESETS = {
  RANKING: {
    spaceBetween: 26,
    slidesPerView: 2.2,
    breakpoints: {
      768: { slidesPerView: 3.5 },
      1024: { slidesPerView: 5 }
    }
  },
  RECOMMEND: {
    spaceBetween: 26,
    slidesPerView: 2, // 768px 미만 기본 (모바일 세로배열에서 2개 노출)
    breakpoints: {
      768: { slidesPerView: 1 },
      950: { slidesPerView: 2 },
      1200: { slidesPerView: 3 }
    }
  },
  YOUTUBE: {
    spaceBetween: 26,
    slidesPerView: 1.35,
    breakpoints: {
      480: { slidesPerView: 1.6 },
      768: { slidesPerView: 2.2 },
      1024: { slidesPerView: 3 }
    }
  },
  THEME_COLLECTION: {
    spaceBetween: 26,
    slidesPerView: 1.5,
    breakpoints: {
      480: { slidesPerView: 1.8 },
      768: { slidesPerView: 2.2 },
      1024: { slidesPerView: 4 }
    }
  },
  DETAIL_SIMILAR: {
    spaceBetween: 26,
    slidesPerView: 2.2,
    freeMode: true,
    breakpoints: {
      768: { 
        slidesPerView: 3.5, 
        spaceBetween: 24,
        freeMode: true
      },
      1024: { 
        slidesPerView: 5, 
        spaceBetween: 26,
        freeMode: { enabled: false } // 데스크톱은 기존 hover UX 유지를 위해 snap 모드 유지
      }
    }
  }
};
