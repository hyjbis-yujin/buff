import { fetchLiveYoutube } from '../client/apiClient';
import { mapYoutubeData } from '../mappers/youtubeMapper';

/**
 * 유튜브 오리지널 예능 데이터 통신 서비스
 */
export const fetchYoutubeVideos = async () => {
  try {
    const json = await fetchLiveYoutube();
    
    if (!json?.data?.list) {
      throw new Error('유튜브 데이터 스키마가 올바르지 않습니다.');
    }

    return json.data.list.map(mapYoutubeData);
  } catch (error) {
    console.error('[Youtube Service Error]', error);
    throw error;
  }
};
