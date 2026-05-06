/**
 * Server-only Theme Collection Service
 * Fetches live data for curated theme collections.
 */
import { fetchTMDB, getValidKRProviders, getTagsFromGenreIds } from './mediaFetcher.js';

const CURATED_THEMES = [
  {
    id: "theme-summer",
    title: "🌿 여름 정주행 모음집 🌿",
    author: "BUFF 큐레이션 팀",
    authorType: "official",
    itemIds: [
      { id: 213713, type: 'tv' }, { id: 1399, type: 'tv' }, { id: 121, type: 'tv' }, 
      { id: 62560, type: 'tv' }, { id: 210733, type: 'tv' }, { id: 210855, type: 'tv' },
      { id: 228551, type: 'tv' }, { id: 671, type: 'movie' }, { id: 672, type: 'movie' },
      { id: 114472, type: 'tv' }
    ]
  },
  {
    id: "theme-action",
    title: "🎬 액션 쾌감! 실패 없는 정주행 리스트",
    author: "BUFF 정주행러",
    authorType: "user",
    itemIds: [
      { id: 299536, type: 'movie' }, { id: 155, type: 'movie' }, { id: 19995, type: 'movie' }, 
      { id: 680, type: 'movie' }, { id: 118340, type: 'movie' }, { id: 507086, type: 'movie' }, 
      { id: 475557, type: 'movie' }, { id: 299534, type: 'movie' }, { id: 24428, type: 'movie' }
    ]
  },
  {
    id: "theme-romance",
    title: "💖 설렘 주의! 로맨틱 정주행",
    author: "사랑꾼 큐레이터",
    authorType: "user",
    itemIds: [
      { id: 216390, type: 'tv' }, { id: 125910, type: 'tv' }, { id: 120998, type: 'tv' },
      { id: 154825, type: 'tv' }, { id: 231693, type: 'tv' }, { id: 136283, type: 'tv' },
      { id: 205562, type: 'tv' }, { id: 112888, type: 'tv' }, { id: 102917, type: 'tv' },
      { id: 210855, type: 'tv' }
    ]
  },
  {
    id: "theme-thriller",
    title: "🕵️‍♂️ 한 치 앞도 모르는 미스터리/스릴러",
    author: "BUFF 오피셜",
    authorType: "official",
    itemIds: [
      { id: 110356, type: 'tv' }, { id: 115036, type: 'tv' }, { id: 127532, type: 'tv' },
      { id: 60625, type: 'tv' }, { id: 1396, type: 'tv' }, { id: 111110, type: 'tv' },
      { id: 104257, type: 'tv' }, { id: 1412, type: 'tv' }, { id: 63174, type: 'tv' }
    ]
  },
  {
    id: "theme-classic",
    title: "🎞 다시 봐도 명작, 인생 영화 컬렉션",
    author: "영화 비평가",
    authorType: "user",
    itemIds: [
      { id: 278, type: 'movie' }, { id: 238, type: 'movie' }, { id: 424, type: 'movie' },
      { id: 497, type: 'movie' }, { id: 13, type: 'movie' }, { id: 313369, type: 'movie' },
      { id: 496243, type: 'movie' }, { id: 129, type: 'movie' }, { id: 510, type: 'movie' }
    ]
  },
  {
    id: "theme-animation",
    title: "🧸 동심 소환! 어른이들을 위한 애니메이션",
    author: "BUFF 키즈",
    authorType: "official",
    itemIds: [
      { id: 1022789, type: 'movie' }, { id: 502356, type: 'movie' }, { id: 14160, type: 'movie' },
      { id: 12, type: 'movie' }, { id: 585, type: 'movie' }, { id: 49013, type: 'movie' },
      { id: 150540, type: 'movie' }, { id: 1184918, type: 'movie' }, { id: 210577, type: 'movie' }
    ]
  },
  {
    id: "theme-sf",
    title: "🌌 미지의 세계로! SF & 판타지 대작",
    author: "BUFF 공식 에디터",
    authorType: "official",
    itemIds: [
      { id: 438631, type: 'movie' }, { id: 264660, type: 'movie' }, { id: 27205, type: 'movie' },
      { id: 603, type: 'movie' }, { id: 71446, type: 'tv' }, { id: 82856, type: 'tv' },
      { id: 100088, type: 'tv' }, { id: 157336, type: 'movie' }
    ]
  },
  {
    id: "theme-docu",
    title: "🌍 현실이 더 영화 같은 다큐멘터리",
    author: "지식 큐레이터",
    authorType: "user",
    itemIds: [
      { id: 738652, type: 'movie' }, { id: 656516, type: 'movie' }, { id: 924520, type: 'movie' },
      { id: 399174, type: 'movie' }, { id: 163102, type: 'movie' }, { id: 567710, type: 'movie' },
      { id: 95667, type: 'tv' }, { id: 83880, type: 'tv' }, { id: 82136, type: 'tv' },
      { id: 62710, type: 'tv' }, { id: 88584, type: 'tv' }, { id: 391605, type: 'movie' },
      { id: 793730, type: 'movie' }, { id: 68507, type: 'tv' }, { id: 114472, type: 'tv' }
    ]
  },
  {
    id: "theme-comedy",
    title: "🤣 웃음 보장! 배꼽 잡는 코미디 모음",
    author: "BUFF 꿀잼봇",
    authorType: "official",
    itemIds: [
      { id: 1668, type: 'tv' }, { id: 2316, type: 'tv' }, { id: 48891, type: 'tv' },
      { id: 1421, type: 'tv' }, { id: 8363, type: 'movie' }, { id: 18785, type: 'movie' },
      { id: 714, type: 'movie' }, { id: 1100, type: 'tv' }, { id: 93405, type: 'tv' }
    ]
  },
  {
    id: "theme-horror",
    title: "👻 잠 못 드는 밤, 오싹한 공포/스릴러",
    author: "공포 마니아",
    authorType: "user",
    itemIds: [
      { id: 138843, type: 'movie' }, { id: 419430, type: 'movie' }, { id: 447332, type: 'movie' },
      { id: 493922, type: 'movie' }, { id: 346364, type: 'movie' }, { id: 66732, type: 'tv' },
      { id: 396535, type: 'movie' }, { id: 530385, type: 'movie' }, { id: 310131, type: 'movie' }
    ]
  }
];

export async function getLiveCollections() {
  return await Promise.all(CURATED_THEMES.map(async (theme) => {
    const items = await Promise.all(theme.itemIds.map(async (item) => {
      try {
        const details = await fetchTMDB(`/${item.type}/${item.id}?language=ko-KR&append_to_response=watch/providers`);
        if (!details.poster_path) return null;
        return {
          id: item.id.toString(),
          title: details.name || details.title,
          mediaType: item.type,
          image: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
          tags: getTagsFromGenreIds(details.genres?.map(g => g.id)),
          providers: getValidKRProviders(details['watch/providers'])
        };
      } catch (e) {
        return null;
      }
    }));

    return {
      id: theme.id,
      title: theme.title,
      author: theme.author,
      authorType: theme.authorType,
      updatedAt: new Date().toISOString(),
      items: items.filter(Boolean)
    };
  }));
}
