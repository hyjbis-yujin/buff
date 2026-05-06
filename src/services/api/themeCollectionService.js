import { fetchLiveCollections } from '../client/apiClient';
import { mapThemeCollectionData } from '../mappers/themeCollectionMapper';

/**
 * 테마 컬렉션 데이터 통신 서비스
 */
export const fetchThemeCollections = async () => {
  try {
    const json = await fetchLiveCollections();
    
    if (!json?.data?.list) {
      throw new Error('데이터 스키마가 올바르지 않습니다.');
    }

    return json.data.list.map(mapThemeCollectionData);
  } catch (error) {
    console.error('[ThemeCollection Service Error]', error);
    throw error;
  }
};
