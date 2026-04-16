import { mapYoutubeData } from '../mappers/youtubeMapper';

/**
 * 유튜브 오리지널 예능 데이터 통신 서비스
 */
export const fetchYoutubeVideos = async () => {
  try {
    const response = await fetch('/data/youtube.json');
    if (!response.ok) {
      throw new Error(`유튜브 데이터 통신 에러: ${response.status}`);
    }

    const json = await response.json();
    
    // API 규격 체크
    if (json?.code !== 200 || !json?.data?.list) {
      throw new Error('유튜브 데이터 스키마가 올바르지 않습니다.');
    }

    // 통신 완료 후 맵퍼를 통해 UI 맞춤형 데이터로 변환
    return json.data.list.map(mapYoutubeData);
  } catch (error) {
    console.error('[Youtube Service Error]', error);
    throw error;
  }
};
