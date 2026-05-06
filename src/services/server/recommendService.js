/**
 * Server-only Recommend Service
 * Enriches curated recommendation IDs with live TMDB data.
 */
import { fetchTMDB, getValidKRProviders, getTagsFromGenreIds } from './mediaFetcher.js';

// Curated list of TMDB IDs for "Recommended" section
const CURATED_RECOMMENDS = [
  { id: 280945, type: 'tv', synopsis: "타임슬립 한 프렌치 셰프가 최악의 폭군이면서 최고의 미식가인 왕을 만나게 되면서 500년을 뛰어넘는 판타지 서바이벌 로맨스" },
  { id: 231280, type: 'tv', synopsis: "폭력과 범죄가 난무하는 세상. 경찰이 된 챔피언 운동선수들이 탁월한 능력으로 잔악무도한 악당들을 상대한다." },
  { id: 258025, type: 'tv', synopsis: "죽음의 운명이 결정된 소년 견우와 그의 목숨을 구하기 위해 나선 MZ 무당 소녀 성아의 첫사랑이 담긴 청춘의 이야기가 시작된다." },
  { id: 261980, type: 'tv', synopsis: "얼굴 빼고 모든 게 다른 쌍둥이 자매가 인생을 맞바꾸는 거짓말로 진짜 사랑과 인생을 찾아가는 로맨틱 성장 드라마" },
  { id: 229891, type: 'tv', synopsis: "촬영차 전 세계를 오가는 스타 배우와 그녀의 통역사. 서로를 향한 마음이 깊어지는 것과 달리 설렘의 감정은 자꾸만 오역이 되는데. 과연 둘만의 사랑의 언어를 찾을 수 있을까?" },
  { id: 239385, type: 'tv', synopsis: "평범하게 살아가던 한 남자가 어느 날 갑자기 삶이 송두리째 조작돼 나락에 떨어지자 지옥에서 돌아와 벌이는 핏빛 복수극" },
  { id: 281006, type: 'tv', synopsis: "재벌 상속남과 똥고집 셰프의 전쟁 같은 키친 타카 성장 로맨스" },
  { id: 280946, type: 'tv', synopsis: "IMF 부도위기를 온몸으로 맞았지만, 정면으로 돌파해 나가는 중소기업과 그 가족들의 고군분투를 그리는 드라마" },
  { id: 284744, type: 'tv', synopsis: "출세에 목맨 속물 판사가 본의 아니게 공익변호사가 되며 벌어지는 좌충우돌 휴먼 법정물" },
  { id: 256226, type: 'tv', synopsis: "국내 최고의 여배우 '백아진'의 몰락, 그리고 그 뒤에 숨겨진 그녀의 두 얼굴." }
];

export async function getLiveRecommendations() {
  const enrichedList = await Promise.all(CURATED_RECOMMENDS.map(async (item) => {
    try {
      const details = await fetchTMDB(`/${item.type}/${item.id}?language=ko-KR&append_to_response=watch/providers`);
      
      return {
        id: item.id.toString(),
        tmdbId: item.id,
        mediaType: item.type,
        title: details.name || details.title,
        description: item.synopsis, // Use curated synopsis
        image: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
        backdrop: `https://image.tmdb.org/t/p/original${details.backdrop_path}`,
        tags: getTagsFromGenreIds(details.genres?.map(g => g.id)),
        providers: getValidKRProviders(details['watch/providers'])
      };
    } catch (e) {
      console.error(`Failed to enrich recommend item ${item.id}:`, e.message);
      return null;
    }
  }));

  return enrichedList.filter(Boolean);
}
