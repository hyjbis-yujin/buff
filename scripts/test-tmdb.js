const { loadEnv, fetchTMDB } = require('./shared-utils');
loadEnv();
const API_KEY = process.env.TMDB_API_KEY;

async function test() {
  const providers = [
    { name: 'tving', id: 389 },
    { name: 'coupang', id: 119 },
    { name: 'netflix', id: 8 }
  ];

  for (const p of providers) {
    try {
      console.log(`\n--- Testing ${p.name} (ID: ${p.id}) ---`);
      
      // 1. TV Discover (최소한의 필터로 테스트)
      const tvUrl = `/discover/tv?language=ko-KR&watch_region=KR&with_watch_providers=${p.id}`;
      const tvRes = await fetchTMDB(tvUrl, API_KEY);
      console.log(`TV 수: ${tvRes.total_results || 0}`);
      if (tvRes.results && tvRes.results.length > 0) {
        console.log(`Top item: ${tvRes.results[0].name}`);
      }

      // 2. Movie Discover
      const movieUrl = `/discover/movie?language=ko-KR&watch_region=KR&with_watch_providers=${p.id}`;
      const movieRes = await fetchTMDB(movieUrl, API_KEY);
      console.log(`Movie 수: ${movieRes.total_results || 0}`);
    } catch (e) {
      console.error(`Error testing ${p.name}: ${e.message}`);
    }
  }
}

test();
