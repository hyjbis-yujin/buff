/**
 * Server-only Media Fetcher
 * This service handles direct communication with TMDB and YouTube APIs.
 * MUST NOT be imported in client-side code.
 */

// Helper to get environment variables in both Node.js (scripts) and Serverless environments
const getApiKey = (key) => {
  return process.env[key] || process.env[`VITE_${key}`];
};

/**
 * TMDB API Call Wrapper
 */
export async function fetchTMDB(endpoint) {
  const API_KEY = getApiKey('TMDB_API_KEY');
  if (!API_KEY) throw new Error('Missing TMDB_API_KEY');

  const url = `https://api.themoviedb.org/3${endpoint}`;
  const res = await fetch(url, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`
    }
  });

  if (!res.ok) {
    throw new Error(`TMDB API Error: ${res.status} ${res.statusText} at ${endpoint}`);
  }

  return res.json();
}

/**
 * YouTube API Call Wrapper
 */
export async function fetchYoutube(endpoint) {
  const API_KEY = getApiKey('YOUTUBE_API_KEY');
  if (!API_KEY) throw new Error('Missing YOUTUBE_API_KEY');

  const url = `https://www.googleapis.com/youtube/v3${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`YouTube API Error: ${res.status} ${res.statusText} at ${endpoint}`);
  }

  return res.json();
}

/**
 * Utility: Filter valid KR providers
 */
const SUPPORTED_KR_PROVIDERS = [8, 356, 1883, 337, 1881];
export function getValidKRProviders(watchData) {
  const krProviders = watchData?.results?.KR?.flatrate || [];
  return krProviders
    .filter(p => SUPPORTED_KR_PROVIDERS.includes(p.provider_id))
    .map(p => ({
      id: p.provider_id,
      name: p.provider_name.split(' ')[0],
      logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`
    }));
}

/**
 * Utility: Genre ID to Tags
 */
const TMDB_GENRES = {
  10759: "액션", 16: "애니메이션", 35: "코미디", 80: "범죄", 
  99: "다큐", 18: "드라마", 10751: "가족", 10762: "키즈", 
  10764: "리얼리티", 10765: "SF/판타지", 9648: "미스터리",
  28: "액션", 12: "모험", 16: "애니메이션", 35: "코미디", 
  80: "범죄", 99: "다큐멘터리", 18: "드라마", 10751: "가족", 
  14: "판타지", 36: "역사", 27: "공포", 10402: "음악", 
  9648: "미스터리", 10749: "로맨스", 878: "SF", 10770: "TV 영화", 
  53: "스릴러", 10752: "전쟁", 37: "서부"
};

export function getTagsFromGenreIds(genreIds) {
  return (genreIds || [])
    .map(id => TMDB_GENRES[id])
    .filter(Boolean)
    .map(genre => `# ${genre}`)
    .slice(0, 3);
}
