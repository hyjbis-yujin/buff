/**
 * Client-side API Client with Fallback Strategy
 * MUST NOT import any server-side logic from src/services/server/.
 */

/**
 * Generic fetch with fallback to static JSON
 * @param {string} apiPath - The serverless API path (e.g., '/api/rankings')
 * @param {string} staticPath - The fallback static JSON path (e.g., '/data/rankings.json')
 */
export async function fetchWithFallback(apiPath, staticPath) {
  try {
    // 1. Try the live API first (force validation to prevent stale deployed cache)
    const response = await fetch(apiPath, { cache: 'no-cache' });
    
    if (response.ok) {
      const json = await response.json();
      if (json && json.code === 200) {
        console.log(`[API] Successfully fetched live data from ${apiPath}`);
        return json;
      }
    }
    
    // If response is not ok or schema is wrong, throw to trigger fallback
    throw new Error(`API ${apiPath} returned invalid response`);
    
  } catch (error) {
    console.warn(`[Fallback] API ${apiPath} failed, falling back to static ${staticPath}. Error:`, error.message);
    
    // 2. Try the static JSON fallback
    try {
      // cache: 'no-cache' forces the browser to validate with the server (e.g. Vercel Edge) 
      // using ETag, allowing 304 Not Modified for good performance while avoiding stale data.
      const staticResponse = await fetch(staticPath, {
        cache: 'no-cache'
      });
      if (!staticResponse.ok) {
        throw new Error(`Static fallback ${staticPath} also failed`);
      }
      return await staticResponse.json();
    } catch (staticError) {
      console.error(`[Critical] Both API and static fallback failed for ${apiPath}`);
      throw staticError;
    }
  }
}

/**
 * Rankings API Wrapper
 */
export const fetchLiveRankings = () => fetchWithFallback('/api/rankings', '/data/rankings.json');

/**
 * YouTube API Wrapper
 */
export const fetchLiveYoutube = () => fetchWithFallback('/api/youtube', '/data/youtube.json');

/**
 * Recommends API Wrapper
 */
export const fetchLiveRecommends = () => fetchWithFallback('/api/recommends', '/data/recommends.json');

/**
 * Collections API Wrapper
 * 배포 환경(Vercel)의 라이브 API가 잘못된 ID(더미 데이터)를 불러오는 문제를 원천 차단하고, 
 * 수동으로 예쁘게 큐레이션된 정적 JSON 파일을 로컬/배포 동일하게 바라보도록 강제합니다.
 */
export const fetchLiveCollections = async () => {
  const response = await fetch('/data/theme-collections.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error('Failed to fetch theme collections');
  return await response.json();
};
