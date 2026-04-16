import { mapContentDetail } from '../mappers/detailMapper';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY; // .env에 VITE_TMDB_API_KEY 추가 필요

/**
 * 상세 페이지 전용 실시간 API 서비스
 * 1단계 책임: 기본 정보, 출연진, 비슷한 콘텐츠, 스트리밍 제공처(Watch Providers)
 */
export const fetchContentDetail = async (mediaType, id) => {
  if (!API_KEY) {
    console.warn('TMDB API Key is missing. Please add VITE_TMDB_API_KEY to your .env file.');
    throw new Error('API 키가 설정되지 않았습니다.');
  }

  try {
    // 필수 데이터 통합 호출 (Bearer 토큰 인증 방식 사용)
    const endpoint = `${TMDB_BASE_URL}/${mediaType}/${id}?language=ko-KR&append_to_response=credits,similar,watch/providers`;
    
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`상세 정보를 가져오는 데 실패했습니다 (Status: ${response.status})`);
    }

    const rawData = await response.json();
    const currentGenres = rawData.genres?.map(g => g.id) || [];
    
    // [Updated] 품질 중심 추천 알고리즘 로직
    // 1단계: Recommendations(고품질) + Similar 통합 수집
    const recRes = await fetch(`${TMDB_BASE_URL}/${mediaType}/${id}/recommendations?language=ko-KR`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const recData = await recRes.json();
    
    const recommendations = (recData.results || []).map(item => ({ ...item, _isRec: true }));
    const similar = (rawData.similar?.results || []).map(item => ({ ...item, _isRec: false }));
    
    // 중복 제거 및 점수 산정 (최대 40~50개 풀 구성)
    const combinedPool = Array.from(new Map([...recommendations, ...similar].map(item => [item.id, item])).values())
      .map(item => {
        let score = 0;
        if (item._isRec) score += 15; // 추천 데이터 우선
        if ((item.media_type || mediaType) === mediaType) score += 10; // 미디어 타입 일치 우선
        
        // 장르 매칭 점수 (개당 3점)
        const commonGenres = (item.genre_ids || []).filter(gid => currentGenres.includes(gid));
        score += commonGenres.length * 3;
        
        return { ...item, _score: score };
      })
      .sort((a, b) => b._score - a._score) // 점수 높은 순 정렬
      .slice(0, 50);
    
    // 2단계: 단계적 KR Provider 체크 (조기 중단 로직 적용)
    const enrichedSimilar = [];
    const targetCount = 15;
    const batchSize = 5; // 5개씩 끊어서 확인하여 성능 최적화
    
    for (let i = 0; i < combinedPool.length; i += batchSize) {
      if (enrichedSimilar.length >= targetCount) break;
      
      const batch = combinedPool.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(async (item) => {
        try {
          const pRes = await fetch(`${TMDB_BASE_URL}/${mediaType}/${item.id}/watch/providers`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
          });
          const pData = await pRes.json();
          const krProviders = pData?.results?.KR?.flatrate || [];
          
          // 국내 유효 Provider 체크
          const supportedIds = [8, 356, 1883, 337, 1881, 1796];
          const hasKR = krProviders.some(p => supportedIds.includes(p.provider_id));
          
          if (!hasKR) return null;
          return { ...item, 'watch/providers': pData };
        } catch (e) {
          return null;
        }
      }));
      
      enrichedSimilar.push(...batchResults.filter(Boolean));
    }

    // 최종 15개 확정 (최대 20개 내외)
    rawData.similar.results = enrichedSimilar.slice(0, targetCount);
    
    // 매퍼를 통해 정규화된 UI 모델 반환
    return mapContentDetail(rawData, mediaType);
  } catch (error) {
    console.error('[Detail Service Error]', error);
    throw error;
  }
};
