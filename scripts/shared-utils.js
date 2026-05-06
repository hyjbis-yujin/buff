const fs = require('fs');
const path = require('path');

/**
 * 1. 환경 변수 로드
 */
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      envFile.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim();
          process.env[key] = val;
          if (key === 'VITE_TMDB_API_KEY') process.env['TMDB_API_KEY'] = val;
          if (key === 'VITE_YOUTUBE_API_KEY') process.env['YOUTUBE_API_KEY'] = val;
        }
      });
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * 2. 제공자 및 장르 매핑 테이블
 */
const SUPPORTED_KR_PROVIDERS = [8, 356, 1883, 337, 1881]; // 넷플릭스, 웨이브, 티빙, 디즈니+, 쿠팡플레이

const PROVIDER_MAP = {
  8: 'netflix',
  356: 'wavve',
  1883: 'tving',
  337: 'disney',
  1881: 'coupang'
};

/**
 * 한국(KR) 지역의 유효한 OTT 제공처가 있는지 확인
 */
function getValidKRProviders(watchData) {
  const krProviders = watchData?.results?.KR?.flatrate || [];
  return krProviders
    .filter(p => SUPPORTED_KR_PROVIDERS.includes(p.provider_id))
    .map(p => ({
      id: p.provider_id,
      name: p.provider_name.split(' ')[0],
      logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`
    }));
}

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

/**
 * 3. TMDB API 호출 래퍼
 */
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

/**
 * 4. 장르 ID 배열 -> 태그 배열 변환
 */
function getTagsFromGenreIds(genreIds) {
  return (genreIds || [])
    .map(id => TMDB_GENRES[id])
    .filter(Boolean)
    .map(genre => `# ${genre}`)
    .slice(0, 3);
}

module.exports = {
  loadEnv,
  PROVIDER_MAP,
  TMDB_GENRES,
  fetchTMDB,
  getTagsFromGenreIds,
  getValidKRProviders
};
