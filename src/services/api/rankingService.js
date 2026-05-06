import { fetchLiveRankings } from '../client/apiClient';
import { mapAllRankings } from '../mappers/rankingMapper';

/**
 * 플랫폼별 오늘의 인기 콘텐츠 통신 서비스
 */
export const fetchRankings = async () => {
  try {
    const json = await fetchLiveRankings();
    
    if (!json?.data) {
      throw new Error('랭킹 데이터 스키마가 올바르지 않습니다.');
    }

    return mapAllRankings(json.data);
  } catch (error) {
    console.error('[Ranking Service Error]', error);
    throw error;
  }
};
