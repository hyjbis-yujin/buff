import { mapContentDetail } from '../mappers/detailMapper';
import { getProviderById } from '../../constants/providers';
import { getTagsFromGenreIds } from '../../constants/genres';
import { normalizeImageUrl } from '../normalizers/contentNormalizer';

// Separated Caching
const heroCache = new Map();
const similarCache = new Map();

/**
 * 1단계: 상세 페이지 기본 정보 호출 (Proxy API 사용)
 */
export const fetchContentDetail = async (mediaType, id) => {
  const cacheKey = `${mediaType}-${id}`;
  if (heroCache.has(cacheKey)) return heroCache.get(cacheKey);

  try {
    // TMDB 직접 호출 대신 우리 서버 API 호출 (보안 강화)
    const response = await fetch(`/api/detail?mediaType=${mediaType}&id=${id}`);
    if (!response.ok) throw new Error('상세 정보를 가져오는 데 실패했습니다.');

    const { rawData, candidatePool } = await response.json();
    
    // 메인 데이터 매핑
    const heroData = mapContentDetail({ ...rawData, similar: { results: [] } }, mediaType);
    
    const result = {
      ...heroData,
      candidatePool 
    };

    heroCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('[Hero Detail Error]', error);
    throw error;
  }
};

/**
 * 2단계: 비슷한 콘텐츠 상세 검증 및 로드 (Proxy API 사용)
 */
export const fetchSimilarContent = async (mediaType, candidatePool) => {
  if (!candidatePool || candidatePool.length === 0) return [];

  const poolIds = candidatePool.map(c => c.id).sort().join(',');
  if (similarCache.has(poolIds)) return similarCache.get(poolIds);

  try {
    // 서버에서 일괄 검증된 데이터를 받아옴
    const response = await fetch('/api/similar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaType, candidatePool })
    });

    if (!response.ok) throw new Error('추천 정보를 가져오는 데 실패했습니다.');

    const enrichedRawItems = await response.json();

    // 데이터 최종 매핑 (Mapper 로직 활용)
    const enrichedItems = enrichedRawItems.map(item => {
      const krProviders = item['watch/providers']?.results?.KR?.flatrate || [];
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
    });

    similarCache.set(poolIds, enrichedItems);
    return enrichedItems;
  } catch (error) {
    console.error('[Similar Enrichment Error]', error);
    return [];
  }
};

/**
 * 프리페칭
 */
export const prefetchContentDetail = (mediaType, id) => {
  const cacheKey = `${mediaType}-${id}`;
  if (heroCache.has(cacheKey)) return;
  fetchContentDetail(mediaType, id).catch(() => {});
};
