import { getCuratedYoutubeList } from '../src/services/server/youtubeService.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  try {
    const list = await getCuratedYoutubeList();

    if (!list || list.length < 3) {
      throw new Error("수집된 예능 영상이 부족합니다.");
    }

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "success",
      meta: {
        updatedAt: new Date().toISOString(),
        totalCount: list.length,
        isLive: true
      },
      data: {
        list
      }
    });
  } catch (error) {
    console.error("YouTube API Error:", error);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: error.message
    });
  }
}
