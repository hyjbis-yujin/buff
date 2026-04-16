import { mapRecommendData } from '../mappers/recommendMapper';

/**
 * 추천작 섹션 통신용 로직 분리
 */
export const fetchRecommendations = async () => {
  try {
    const response = await fetch('/data/recommends.json');
    if (!response.ok) {
      throw new Error(`서버 에러 상태코드: ${response.status}`);
    }

    const json = await response.json();
    
    // API 규격 체크 (예외 방어 코드 유지)
    if (json?.code !== 200 || !json?.data?.list) {
      throw new Error('응답 데이터 스키마가 올바르지 않습니다.');
    }

    // 통신 완료 후 정제(Mapper) 된 UI 맞춤형 데이터 배열 반환
    return json.data.list.map(mapRecommendData).filter(Boolean);
  } catch (error) {
    console.error('[Recommend Service Error]', error);
    throw error; // UI 컴포넌트 쪽으로 에러 전파하여 에러 화면 렌더링 시작
  }
};
