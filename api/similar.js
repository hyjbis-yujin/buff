import { getEnrichedSimilarContent } from '../src/services/server/detailService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { mediaType, candidatePool } = req.body;

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  try {
    const data = await getEnrichedSimilarContent(mediaType, candidatePool);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Similar API Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
