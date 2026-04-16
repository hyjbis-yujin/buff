/**
 * TMDB API 전용 헬퍼
 */

const PROVIDER_MAP = {
  8: 'netflix',
  356: 'wavve',
  1883: 'tving',
  337: 'disney',
  1881: 'coupang'
};

const TMDB_GENRES = {
  // TV Genres
  10759: "액션", 16: "애니메이션", 35: "코미디", 80: "범죄", 
  99: "다큐", 18: "드라마", 10751: "가족", 10762: "키즈", 
  10764: "리얼리티", 10765: "SF/판타지", 9648: "미스터리",
  // Movie Genres
  28: "액션", 12: "모험", 16: "애니메이션", 35: "코미디", 
  80: "범죄", 99: "다큐멘터리", 18: "드라마", 10751: "가족", 
  14: "판타지", 36: "역사", 27: "공포", 10402: "음악", 
  9648: "미스터리", 10749: "로맨스", 878: "SF", 10770: "TV 영화", 
  53: "스릴러", 10752: "전쟁", 37: "서부"
};

async function fetchTMDB(endpoint, apiKey) {
  const url = `https://api.themoviedb.org/3${endpoint}`;
  const res = await fetch(url, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${apiKey}`
    }
  });

  if (!res.ok) {
    throw new Error(`TMDB API Error: ${res.status} ${res.statusText} at ${endpoint}`);
  }

  return res.json();
}

function getTagsFromGenreIds(genreIds) {
  return (genreIds || [])
    .map(id => TMDB_GENRES[id])
    .filter(Boolean)
    .map(genre => `# ${genre}`)
    .slice(0, 3);
}

module.exports = {
  PROVIDER_MAP,
  TMDB_GENRES,
  fetchTMDB,
  getTagsFromGenreIds
};
