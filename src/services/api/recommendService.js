import { fetchLiveRecommends } from '../client/apiClient';
import { mapRecommendData } from '../mappers/recommendMapper';

/**
 * 추천작 섹션 통신용 로직 분리
 */
export const fetchRecommendations = async () => {
  try {
    const json = await fetchLiveRecommends();
    
    if (!json?.data?.list) {
      throw new Error('응답 데이터 스키마가 올바르지 않습니다.');
    }

    return json.data.list.map(mapRecommendData).filter(Boolean);
  } catch (error) {
    console.error('[Recommend Service Error]', error);
    throw error;
  }
};
