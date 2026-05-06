import { getLiveRecommendations } from '../src/services/server/recommendService.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  try {
    const list = await getLiveRecommendations();

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
    console.error("Recommend API Error:", error);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: error.message
    });
  }
}
