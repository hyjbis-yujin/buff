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
    // 이미 초기화되었거나 로딩 중이면 중복 호출 방지
    if (get().isLoading || get().isInitialized) return;

    set({ isLoading: true, error: null });

    try {
      // Priority 1: Parallel Fetching
      const [rankings, youtube, recommends, collections] = await Promise.all([
        fetchRankings().catch(err => { console.error('Rankings load failed', err); return {}; }),
        fetchYoutubeVideos().catch(err => { console.error('Youtube load failed', err); return []; }),
        fetchRecommendations().catch(err => { console.error('Recommendations load failed', err); return []; }),
        fetchThemeCollections().catch(err => { console.error('Collections load failed', err); return []; })
      ]);

      set({ 
        rankings, 
        youtubeList: youtube, 
        recommends, 
        collections,
        isInitialized: true 
      });
    } catch (err) {
      set({ error: err });
    } finally {
      set({ isLoading: false });
    }
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
