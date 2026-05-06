import { API_CONFIG } from '../constants/apiConfig';

// 앱 최초 로드 시 고유 타임스탬프 생성 (초기 캐시 무효화)
let currentCacheToken = Date.now();
let lastVisibleTime = Date.now();

// 탭 복귀(Focus) 시 캐시 유효 시간(Stale Time)을 지났다면 토큰 갱신
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const now = Date.now();
      if (now - lastVisibleTime > API_CONFIG.CACHE_STALE_TIME_MS) {
        currentCacheToken = now;
      }
      lastVisibleTime = now;
    }
  });
}

/**
 * 정적 JSON 파일 전용 Fetch 래퍼
 * 앱 최초 진입 또는 일정 시간 이후 탭 복귀 시에만 새로운 타임스탬프를 부여하여 
 * 조건부 캐시 무효화(Cache Busting)를 달성합니다.
 */
export const fetchJSON = async (url, options = {}) => {
  const separator = url.includes('?') ? '&' : '?';
  const bustedUrl = `${url}${separator}t=${currentCacheToken}`;

  const response = await fetch(bustedUrl, {
    ...options,
    headers: {
      'Cache-Control': 'no-cache', // 서버(CDN)에 최신 파일 여부 확인
      ...options.headers,
    }
  });

  return response;
};
