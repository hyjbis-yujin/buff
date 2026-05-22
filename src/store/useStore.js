import { create } from 'zustand';
import { fetchRankings } from '../services/api/rankingService';
import { fetchYoutubeVideos } from '../services/api/youtubeService';
import { fetchRecommendations } from '../services/api/recommendService';
import { fetchThemeCollections } from '../services/api/themeCollectionService';

const useStore = create((set, get) => ({
  // Data States
  rankings: {},
  youtubeList: [],
  recommends: [],
  collections: [],

  // Loading & Error States
  isLoading: false,
  error: null,
  isInitialized: false,

  // Actions
  fetchHomeData: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    const startTime = Date.now();
    const minDelay = 600; // 스켈레톤 깜박임(Flicker) 방지를 위한 최소 600ms 보정 지연

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const wrapWithDelay = async (fetchFn, stateKey) => {
      try {
        const data = await fetchFn();
        const elapsed = Date.now() - startTime;
        if (elapsed < minDelay) {
          await delay(minDelay - elapsed);
        }
        set({ [stateKey]: data });
      } catch (err) {
        console.error(err);
      }
    };
    
    Promise.all([
      wrapWithDelay(fetchRankings, 'rankings'),
      wrapWithDelay(fetchYoutubeVideos, 'youtubeList'),
      wrapWithDelay(fetchRecommendations, 'recommends'),
      wrapWithDelay(fetchThemeCollections, 'collections')
    ]).finally(() => {
      set({ isLoading: false });
    });
    
    set({ isInitialized: true });
  },

  // Partial refresh actions if needed
  refreshRankings: async () => {
    try {
      const data = await fetchRankings();
      set({ rankings: data });
    } catch (err) {
      console.error(err);
    }
  }
}));

export default useStore;
