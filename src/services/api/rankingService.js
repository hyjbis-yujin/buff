import { mapAllRankings } from '../mappers/rankingMapper';

/**
 * 플랫폼별 오늘의 인기 콘텐츠 통신 서비스
 */
export const fetchRankings = async () => {
  try {
    const response = await fetch('/data/rankings.json');
    if (!response.ok) {
      throw new Error(`랭킹 데이터 통신 에러: ${response.status}`);
    }

    const json = await response.json();
    
    // API 규격 체크 (recommendService와 동일한 규칙 유지)
    if (json?.code !== 200 || !json?.data) {
      throw new Error('랭킹 데이터 스키마가 올바르지 않습니다.');
    }

    // 통신 완료 후 맵퍼를 통해 플랫폼별로 그룹화된 데이터 반환
    return mapAllRankings(json.data);
  } catch (error) {
    console.error('[Ranking Service Error]', error);
    throw error;
  }
};
