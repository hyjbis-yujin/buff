import { getProviderById } from '../../constants/providers';
import { normalizeImageUrl } from '../normalizers/contentNormalizer';

/**
 * 커뮤니티 컬렉션 데이터 매퍼
 */
export const mapThemeCollectionData = (rawItem) => {
  if (!rawItem) return null;

  const mappedItems = (rawItem.items || [])
    .map(item => {
      const mappedProviders = (item.providers || [])
        .map(p => getProviderById(p.id))
        .filter(Boolean);

      if (mappedProviders.length === 0) return null;

      return {
        id: item.id?.toString() || '',
        title: item.title || '제목 없음',
        mediaType: item.mediaType || 'tv',
        image: normalizeImageUrl(item.image, 'w500') || item.image,
        tags: Array.isArray(item.tags) ? item.tags : [],
        providers: mappedProviders.map(p => ({
          id: p.id,
          name: p.label,
          logo: p.logo
        }))
      };
    })
    .filter(Boolean);

  return {
    id: rawItem.id?.toString() || Math.random().toString(36).substring(2, 11),
    title: rawItem.title || '테마 컬렉션',
    author: rawItem.author || '익명의 유저',
    authorType: rawItem.authorType || 'user',
    items: mappedItems,
    theme: rawItem.theme || 'general',
    updatedAt: rawItem.updatedAt || null
  };
};
