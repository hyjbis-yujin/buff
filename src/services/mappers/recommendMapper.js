import { getProviderById } from '../../constants/providers';
import { normalizeImageUrl } from '../normalizers/contentNormalizer';

/**
 * 백엔드 추천작 API 응답을 프론트엔드 모델로 파싱
 */
export const mapRecommendData = (rawItem) => {
  if (!rawItem) return null;

  const mappedProviders = (rawItem.providers || [])
    .map(p => getProviderById(p.id))
    .filter(Boolean);

  if (mappedProviders.length === 0) return null;

  return {
    id: rawItem.contentId?.toString() || rawItem.tmdbId?.toString(),
    tmdbId: rawItem.tmdbId,
    mediaType: rawItem.mediaType || 'tv',
    image: rawItem.image || normalizeImageUrl(rawItem.posterUrl, 'w500') || rawItem.posterUrl, 
    providers: mappedProviders.map(p => ({
      id: p.id,
      name: p.label,
      logo: p.logo
    })),
    title: rawItem.title || rawItem.titleName || '제목 정보 없음',
    tags: Array.isArray(rawItem.tags) ? rawItem.tags : [], 
    description: rawItem.synopsis || rawItem.description || '줄거리 정보가 제공되지 않았습니다.'
  };
};
