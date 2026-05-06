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
    // 1. Try the live API first
    const response = await fetch(apiPath);
    
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
      const staticResponse = await fetch(staticPath);
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
 */
export const fetchLiveCollections = () => fetchWithFallback('/api/collections', '/data/theme-collections.json');
