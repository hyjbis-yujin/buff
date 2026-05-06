import { getLiveContentDetail } from '../src/services/server/detailService.js';

export default async function handler(req, res) {
  const { mediaType, id } = req.query;

  if (!mediaType || !id) {
    return res.status(400).json({ message: "Missing mediaType or id" });
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  try {
    const data = await getLiveContentDetail(mediaType, id);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Detail API Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
