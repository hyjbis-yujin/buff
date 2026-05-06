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
      { id: 213713, type: 'tv' }, // Frieren
      { id: 1399, type: 'tv' },   // Game of Thrones
      { id: 121, type: 'tv' },    // Doctor Who
      { id: 62560, type: 'tv' }   // Mr. Robot
    ]
  },
  {
    id: "theme-action",
    title: "🎬 액션 쾌감! 실패 없는 정주행 리스트",
    author: "BUFF 정주행러",
    authorType: "user",
    itemIds: [
      { id: 299536, type: 'movie' }, // Infinity War
      { id: 155, type: 'movie' },    // The Dark Knight
      { id: 19995, type: 'movie' },   // Avatar
      { id: 27205, type: 'movie' }    // Inception
    ]
  }
];

export async function getLiveCollections() {
  return await Promise.all(CURATED_THEMES.map(async (theme) => {
    const items = await Promise.all(theme.itemIds.map(async (item) => {
      try {
        const details = await fetchTMDB(`/${item.type}/${item.id}?language=ko-KR&append_to_response=watch/providers`);
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
