/**
 * Server-only Detail Service
 */
import { fetchTMDB } from './mediaFetcher.js';

/**
 * 상세 정보 및 추천 후보군 조회
 */
export async function getLiveContentDetail(mediaType, id) {
  // 1. 상세 정보 + 크레딧 + 제공처 일괄 호출
  const rawData = await fetchTMDB(`/${mediaType}/${id}?language=ko-KR&append_to_response=credits,watch/providers`);
  
  // 2. 추천 및 비슷한 작품 후보군 수집
  const [recData, simData] = await Promise.all([
    fetchTMDB(`/${mediaType}/${id}/recommendations?language=ko-KR`),
    fetchTMDB(`/${mediaType}/${id}/similar?language=ko-KR`)
  ]);

  const currentGenres = rawData.genres?.map(g => g.id) || [];
  const recommendations = (recData.results || []).map(item => ({ ...item, _isRec: true }));
  const similar = (simData.results || []).map(item => ({ ...item, _isRec: false }));
  
  // 3. 후보군 랭킹 산정 (상위 20개 선정)
  const candidatePool = Array.from(new Map([...recommendations, ...similar].map(item => [item.id, item])).values())
    .map(item => {
      let score = 0;
      if (item._isRec) score += 15;
      if ((item.media_type || mediaType) === mediaType) score += 10;
      const commonGenres = (item.genre_ids || []).filter(gid => currentGenres.includes(gid));
      score += commonGenres.length * 3;
      return { ...item, _score: score };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, 20);

  return {
    rawData,
    candidatePool
  };
}

/**
 * 비슷한 작품들의 OTT 제공처 일괄 검증 (병렬)
 */
export async function getEnrichedSimilarContent(mediaType, candidatePool) {
  const results = await Promise.allSettled(candidatePool.map(async (item) => {
    try {
      const pData = await fetchTMDB(`/${item.media_type || mediaType}/${item.id}/watch/providers`);
      const krProviders = pData?.results?.KR?.flatrate || [];
      
      const supportedIds = [8, 356, 1883, 337, 1881, 1796];
      const hasKR = krProviders.some(p => supportedIds.includes(p.provider_id));
      
      if (!hasKR) return null;
      
      return {
        ...item,
        'watch/providers': pData
      };
    } catch (e) {
      return null;
    }
  }));

  return results
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value)
    .slice(0, 15);
}
