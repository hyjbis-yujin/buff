/**
 * YouTube Data API v3 전용 헬퍼
 */

/**
 * 조회수 포맷터 (예: 1250000 -> 125만회)
 */
function formatViewCount(count) {
  if (!count) return '조회수 0회';
  const num = parseInt(count, 10);
  if (num >= 10000) {
    return `조회수 ${(num / 10000).toFixed(1)}만회`.replace('.0', '');
  }
  return `조회수 ${num}회`;
}

/**
 * YouTube API 호출 래퍼
 */
async function fetchYouTube(endpoint, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3${endpoint}&key=${apiKey}`;
  const res = await fetch(url, {
    headers: {
      'Referer': 'http://localhost:5173/'
    }
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`YouTube API Error: ${res.status} ${errorData.error?.message || res.statusText}`);
  }

  return res.json();
}

const { YOUTUBE_CONFIG } = require('./config');

/**
 * ISO 8601 Duration (PT1H2M3S) 파싱 함수
 */
function parsePTDuration(pt) {
  if (!pt) return 0;
  const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || 0, 10);
  const m = parseInt(match[2] || 0, 10);
  const s = parseInt(match[3] || 0, 10);
  return h * 3600 + m * 60 + s;
}

/**
 * 숏츠/예고편 등 제외 필터
 */
function isOriginalVariety(snippet, contentDetails) {
  const title = (snippet.title || '').toLowerCase();
  const desc = (snippet.description || '').toLowerCase();
  
  // 1. 텍스트 기반 블랙리스트 검사
  const blackList = YOUTUBE_CONFIG.BLACKLIST_KEYWORDS;
  const hasBlackList = blackList.some(k => title.includes(k) || desc.includes(k));
  if (hasBlackList) return false;

  // 2. 영상 길이 기반 검사 (Shorts 제외)
  if (contentDetails && contentDetails.duration) {
    const durationSeconds = parsePTDuration(contentDetails.duration);
    if (durationSeconds <= YOUTUBE_CONFIG.MIN_DURATION_SECONDS) {
      return false; // 지정된 길이보다 짧은 경우 제외
    }
  }
  
  return true;
}

module.exports = {
  formatViewCount,
  fetchYouTube,
  isOriginalVariety
};
