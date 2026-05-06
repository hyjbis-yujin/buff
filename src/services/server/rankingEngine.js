/**
 * Server-only Ranking Engine
 * Handles the logic for merging, filtering, and sorting content rankings.
 */
import { fetchTMDB, getValidKRProviders, getTagsFromGenreIds } from './mediaFetcher.js';
import { RANKING_CONFIG } from '../../constants/mediaConfig.js';

/**
 * Categorize content based on details and mediaType
 */
export function getCategory(details, mediaType) {
  const genreIds = details.genres?.map(g => g.id) || details.genre_ids || [];
  const isAnimation = genreIds.includes(16);
  if (isAnimation) return 'animation';

  if (mediaType === 'tv') {
    const isVariety = genreIds.includes(10764) || genreIds.includes(10767);
    const isKorean = (details.original_language || details.originalLanguage) === 'ko';
    if (isKorean) {
      return isVariety ? 'koreanVariety' : 'koreanLatestDrama';
    }
    return genreIds.includes(18) ? 'globalDrama' : 'others';
  }
  return 'movie';
}

/**
 * Core Ranking Logic for a specific provider
 */
export async function processRankingsForProvider(providerId, providerKey, globalKOPools) {
  // 1. 플랫폼별 인기 순위 후보군 수집 (5페이지)
  const pageIndices = [1, 2, 3, 4, 5];
  const tvResponses = await Promise.all(pageIndices.map(p => 
    fetchTMDB(`/discover/tv?language=ko-KR&sort_by=popularity.desc&watch_region=KR&with_watch_providers=${providerId}&page=${p}&include_adult=false`)
  ));
  const movieResponses = await Promise.all(pageIndices.map(p => 
    fetchTMDB(`/discover/movie?language=ko-KR&sort_by=popularity.desc&watch_region=KR&with_watch_providers=${providerId}&page=${p}&include_adult=false`)
  ));

  const tvResults = tvResponses.flatMap(res => res.results || []);
  const movieResults = movieResponses.flatMap(res => res.results || []);

  const tvItems = tvResults.map(item => ({ ...item, mediaType: 'tv' }));
  const movieItems = movieResults.map(item => ({ ...item, mediaType: 'movie' }));
  
  const combinedPool = [...tvItems, ...movieItems, ...globalKOPools];
  
  // ID 중복 제거
  const uniqueItemsMap = new Map();
  combinedPool.forEach(item => {
    if (item.poster_path && !uniqueItemsMap.has(item.id)) {
      uniqueItemsMap.set(item.id, item);
    }
  });

  const candidateItems = Array.from(uniqueItemsMap.values());

  // 세부 정보 조회 및 필터링
  const enrichedItems = (await Promise.all(candidateItems.map(async (item) => {
    try {
      const details = await fetchTMDB(`/${item.mediaType}/${item.id}?language=ko-KR&append_to_response=watch/providers`);
      
      if (details.adult) return null;
      if (details.popularity > 50 && (details.vote_count || 0) < 3) return null;

      const providers = getValidKRProviders(details['watch/providers']);
      const isOnThisPlatform = providers.some(p => p.id === parseInt(providerId));
      if (!isOnThisPlatform) return null;

      const category = getCategory(details, item.mediaType);
      
      return {
        id: item.id.toString(),
        title: details.name || details.title || item.name || item.title,
        mediaType: item.mediaType,
        category,
        image: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
        genreIds: details.genres?.map(g => g.id) || item.genre_ids || [],
        tags: getTagsFromGenreIds(details.genres?.map(g => g.id) || item.genre_ids),
        popularity: details.popularity || item.popularity || 0,
        originalLanguage: details.original_language || item.original_language,
        releaseDate: details.first_air_date || details.release_date || '0000-00-00',
        providers
      };
    } catch (e) { return null; }
  }))).filter(Boolean);

  // 버킷팅 및 정렬
  const buckets = {};
  RANKING_CONFIG.PRIORITY.forEach(cat => buckets[cat] = []);
  buckets['others'] = [];

  enrichedItems.forEach(item => {
    if (buckets[item.category]) buckets[item.category].push(item);
    else buckets['others'].push(item);
  });

  const dateSortFn = (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate);
  const popSortFn = (a, b) => b.popularity - a.popularity;

  Object.keys(buckets).forEach(cat => {
    if (cat === 'koreanLatestDrama' || cat === 'koreanVariety') buckets[cat].sort(dateSortFn);
    else buckets[cat].sort(popSortFn);
  });

  // 슬롯 채우기
  const selectedItems = [];
  const usedIds = new Set();

  for (const catName of RANKING_CONFIG.PRIORITY) {
    const bucket = buckets[catName];
    const cap = RANKING_CONFIG.CATEGORIES[catName]?.softCap || 0;
    const toTake = bucket.splice(0, Math.min(bucket.length, cap));
    toTake.forEach(item => {
      if (selectedItems.length < RANKING_CONFIG.TOTAL_SLOTS) {
        selectedItems.push(item);
        usedIds.add(item.id);
      }
    });
  }

  if (selectedItems.length < RANKING_CONFIG.TOTAL_SLOTS) {
    const residuals = [
      ...RANKING_CONFIG.PRIORITY.flatMap(cat => buckets[cat]),
      ...buckets['others']
    ].sort(popSortFn);

    for (const item of residuals) {
      if (selectedItems.length < RANKING_CONFIG.TOTAL_SLOTS && !usedIds.has(item.id)) {
        selectedItems.push(item);
        usedIds.add(item.id);
      }
    }
  }

  return selectedItems;
}

/**
 * Fetch global KO pool (Latest + Popular)
 */
export async function fetchGlobalKOPools() {
  const today = new Date().toISOString().split('T')[0];
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const startDate = sixMonthsAgo.toISOString().split('T')[0];

  const [latest1, latest2, latest3, popular, variety1, variety2] = await Promise.all([
    fetchTMDB(`/discover/tv?with_original_language=ko&sort_by=first_air_date.desc&first_air_date.lte=${today}&first_air_date.gte=${startDate}&page=1&include_adult=false`),
    fetchTMDB(`/discover/tv?with_original_language=ko&sort_by=first_air_date.desc&first_air_date.lte=${today}&first_air_date.gte=${startDate}&page=2&include_adult=false`),
    fetchTMDB(`/discover/tv?with_original_language=ko&sort_by=first_air_date.desc&first_air_date.lte=${today}&first_air_date.gte=${startDate}&page=3&include_adult=false`),
    fetchTMDB(`/discover/tv?with_original_language=ko&sort_by=popularity.desc&page=1&include_adult=false`),
    fetchTMDB(`/discover/tv?with_original_language=ko&with_genres=10764,10767&sort_by=popularity.desc&page=1&include_adult=false`),
    fetchTMDB(`/discover/tv?with_original_language=ko&with_genres=10764,10767&sort_by=popularity.desc&page=2&include_adult=false`)
  ]);

  const merged = [
    ...(latest1.results || []),
    ...(latest2.results || []),
    ...(latest3.results || []),
    ...(popular.results || []),
    ...(variety1.results || []),
    ...(variety2.results || [])
  ].map(i => ({ ...i, mediaType: 'tv' }));

  return merged;
}
