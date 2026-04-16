/**
 * 유튜브 예능 데이터 매퍼
 */
export const mapYoutubeData = (rawItem) => {
  return {
    videoId: rawItem?.videoId || '',
    title: rawItem?.title || '제목 정보가 없습니다.',
    thumbnail: rawItem?.thumbnail || '',
    channelName: rawItem?.channelName || '알 수 없는 채널',
    channelImage: rawItem?.channelImage || null, // 신규 추가된 채널 이미지 필드
    viewCount: rawItem?.viewCount || '조회수 정보 없음',
    url: rawItem?.url || `https://www.youtube.com/watch?v=${rawItem?.videoId}`,
    publishedAt: rawItem?.publishedAt || null
  };
};
