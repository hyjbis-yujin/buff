import { getLiveCollections } from '../src/services/server/themeService.js';

export default async function handler(req, res) {
  // 캐시 무효화로 로컬 데이터 즉시 반영 보장
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const list = await getLiveCollections();

    return res.status(200).json({
      code: 200,
      status: "success",
      data: {
        list: list
      }
    });
  } catch (error) {
    console.error("Collections API Error:", error);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: error.message
    });
  }
}
