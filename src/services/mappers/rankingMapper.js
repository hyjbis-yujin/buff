import { getProviderById } from '../../constants/providers';
import { normalizeImageUrl } from '../normalizers/contentNormalizer';

/**
 * 플랫폼별 오늘의 인기 콘텐츠 매퍼
 */
export const mapRankingData = (rawItem) => {
  if (!rawItem) return null;

  const mappedProviders = (rawItem.providers || [])
    .map(p => getProviderById(p.id))
    .filter(Boolean);

  if (mappedProviders.length === 0) return null;

  return {
    id: rawItem.id?.toString() || rawItem.tmdbId?.toString(),
    title: rawItem.title || '제목 정보 없음',
    mediaType: rawItem.mediaType || 'tv',
    image: normalizeImageUrl(rawItem.image, 'w500') || rawItem.image, // 이미 풀 경로면 그대로 사용
    tags: Array.isArray(rawItem.tags) ? rawItem.tags : [],
    providers: mappedProviders.map(p => ({
      id: p.id,
      name: p.label,
      logo: p.logo
    })),
  };
};

/**
 * 전체 랭킹 데이터를 플랫폼별로 매핑
 */
export const mapAllRankings = (data) => {
  if (!data) return {};
  
  const platforms = ['netflix', 'tving', 'wavve', 'disney', 'coupang'];
  const mapped = {};

  platforms.forEach(key => {
    const list = data[key] || [];
    mapped[key] = list.map(mapRankingData).filter(Boolean);
  });

  return mapped;
};
