import { fetchGlobalKOPools, processRankingsForProvider } from '../src/services/server/rankingEngine.js';

const PROVIDER_MAP = {
  8: 'netflix',
  356: 'wavve',
  1883: 'tving',
  337: 'disney',
  1881: 'coupang'
};

export default async function handler(req, res) {
  // SWR 캐시 설정 (1시간 캐시, 24시간 내 백그라운드 갱신)
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  try {
    const globalKOPools = await fetchGlobalKOPools();
    const finalData = {};
    const platformCounts = {};

    const platforms = Object.entries(PROVIDER_MAP);

    // 병렬 처리를 통해 속도 개선
    const results = await Promise.all(platforms.map(async ([id, key]) => {
      const freshItems = await processRankingsForProvider(id, key, globalKOPools);
      return { key, items: freshItems };
    }));

    results.forEach(({ key, items }) => {
      finalData[key] = items || [];
      platformCounts[key] = (items || []).length;
    });

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "success",
      meta: { 
        updatedAt: new Date().toISOString(), 
        region: "KR", 
        platformCounts,
        isLive: true
      },
      data: finalData
    });
  } catch (error) {
    console.error("Ranking API Error:", error);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: error.message
    });
  }
}
