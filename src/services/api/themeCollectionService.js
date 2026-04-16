import { mapThemeCollectionData } from '../mappers/themeCollectionMapper';

/**
 * 테마 컬렉션 데이터 통신 서비스
 */
export const fetchThemeCollections = async () => {
  try {
    // 1순위: 테마 컬렉션 전용 데이터 호출
    let response = await fetch('/data/theme-collections.json');
    
    // [Fallback] 누락 방지 및 하위 호환성을 위해 기존 경로 체크
    if (!response.ok) {
      console.warn('theme-collections.json not found, falling back to community.json');
      response = await fetch('/data/community.json');
    }

    if (!response.ok) {
      throw new Error(`데이터 통신 실패 (Status: ${response.status})`);
    }

    const json = await response.json();
    
    if (json?.code !== 200 || !json?.data?.list) {
      throw new Error('데이터 스키마가 올바르지 않습니다.');
    }

    return json.data.list.map(mapThemeCollectionData);
  } catch (error) {
    console.error('[ThemeCollection Service Error]', error);
    throw error;
  }
};
