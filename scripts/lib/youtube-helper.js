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
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`YouTube API Error: ${res.status} ${errorData.error?.message || res.statusText}`);
  }

  return res.json();
}

/**
 * 숏츠/예고편 등 제외 필터
 */
function isOriginalVariety(snippet) {
  const title = (snippet.title || '').toLowerCase();
  const desc = (snippet.description || '').toLowerCase();
  
  const blackList = ['shorts', 'teaser', '예고편', '티저', 'live', '라이브', '힌트캠'];
  const hasBlackList = blackList.some(k => title.includes(k) || desc.includes(k));
  
  return !hasBlackList;
}

module.exports = {
  formatViewCount,
  fetchYouTube,
  isOriginalVariety
};
