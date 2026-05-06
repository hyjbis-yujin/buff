import { mapContentDetail } from '../mappers/detailMapper';
import { getProviderById } from '../../constants/providers';
import { getTagsFromGenreIds } from '../../constants/genres';
import { normalizeImageUrl } from '../normalizers/contentNormalizer';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Separated Caching
const heroCache = new Map();
const similarCache = new Map();

/**
 * Helper to fetch with Bearer token
 */
const fetchTMDB = async (path) => {
  const response = await fetch(`${TMDB_BASE_URL}${path}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  if (!response.ok) throw new Error(`TMDB API Error: ${response.status}`);
  return response.json();
};

/**
 * 1단계: 상세 페이지 기본 정보 호출 (Hero 영역)
 */
export const fetchContentDetail = async (mediaType, id) => {
  const cacheKey = `${mediaType}-${id}`;
  if (heroCache.has(cacheKey)) return heroCache.get(cacheKey);

  if (!API_KEY) throw new Error('API 키가 설정되지 않았습니다.');

  try {
    // 1. 기본 상세 정보 호출
    const rawData = await fetchTMDB(`/${mediaType}/${id}?language=ko-KR&append_to_response=credits,watch/providers`);
    
    // 2. 추천 후보군 풀 수집 (Enrichment 전 단계)
    const recData = await fetchTMDB(`/${mediaType}/${id}/recommendations?language=ko-KR`);
    const simData = await fetchTMDB(`/${mediaType}/${id}/similar?language=ko-KR`);
    
    const currentGenres = rawData.genres?.map(g => g.id) || [];
    const recommendations = (recData.results || []).map(item => ({ ...item, _isRec: true }));
    const similar = (simData.results || []).map(item => ({ ...item, _isRec: false }));
    
    // 중복 제거 및 랭킹 점수 기반 풀 구성 (Enrichment 대상 선정)
    const candidatePool = Array.from(new Map([...recommendations, ...similar].map(item => [item.id, item])).values())
      .map(item => {
        let score = 0;
        if (item._isRec) score += 15;
        if ((item.media_type || mediaType) === mediaType) score += 10;
        const commonGenres = (item.genre_ids || []).filter(gid => currentGenres.includes(gid));
        score += commonGenres.length * 3;
        return { ...item, _score: score };
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, 20); // 상위 20개만 Enrichment 후보로 압축

    // 3. 메인 데이터 매핑 (비슷한 콘텐츠는 비어있는 상태)
    const heroData = mapContentDetail({ ...rawData, similar: { results: [] } }, mediaType);
    
    const result = {
      ...heroData,
      candidatePool // 하위 섹션 로드를 위해 후보군 풀을 함께 전달
    };

    heroCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('[Hero Detail Error]', error);
    throw error;
  }
};

/**
 * 2단계: 비슷한 콘텐츠 상세 검증 및 로드 (비동기 병렬 처리)
 */
export const fetchSimilarContent = async (mediaType, candidatePool) => {
  if (!candidatePool || candidatePool.length === 0) return [];

  const poolIds = candidatePool.map(c => c.id).sort().join(',');
  if (similarCache.has(poolIds)) return similarCache.get(poolIds);

  try {
    // Promise.allSettled를 통한 대규모 병렬 검증 (일부 실패 허용)
    const results = await Promise.allSettled(candidatePool.map(async (item) => {
      const pData = await fetchTMDB(`/${item.media_type || mediaType}/${item.id}/watch/providers`);
      const krProviders = pData?.results?.KR?.flatrate || [];
      
      const supportedIds = [8, 356, 1883, 337, 1881, 1796];
      const hasKR = krProviders.some(p => supportedIds.includes(p.provider_id));
      
      if (!hasKR) return null;

      // 데이터 매핑 (Normalizer 및 Mapper 로직 활용)
      const sProviders = krProviders
        .map(p => getProviderById(p.provider_id))
        .filter(Boolean);

      return {
        id: item.id.toString(),
        mediaType: item.media_type || mediaType,
        title: item.title || item.name,
        image: normalizeImageUrl(item.poster_path, 'w500'),
        tags: getTagsFromGenreIds(item.genre_ids),
        providers: sProviders.map(p => ({
          id: p.id,
          name: p.label,
          logo: p.logo
        }))
      };
    }));

    const enrichedItems = results
      .filter(r => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value)
      .slice(0, 15); // 최종 15개 노출

    similarCache.set(poolIds, enrichedItems);
    return enrichedItems;
  } catch (error) {
    console.error('[Similar Enrichment Error]', error);
    return []; // 실패 시 빈 배열 반환하여 UI 중단 방지
  }
};

/**
 * 프리페칭 (Hero 정보 우선 로드)
 */
export const prefetchContentDetail = (mediaType, id) => {
  const cacheKey = `${mediaType}-${id}`;
  if (heroCache.has(cacheKey)) return;
  
  fetchContentDetail(mediaType, id).catch(() => {});
};
