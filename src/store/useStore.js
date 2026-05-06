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
    
    // 개별적으로 페칭을 시작하고 결과가 나오는 대로 즉시 업데이트
    // 이렇게 하면 빠른 응답(예: 랭킹)은 먼저 화면에 뜹니다.
    
    fetchRankings().then(data => set({ rankings: data })).catch(() => {});
    fetchYoutubeVideos().then(data => set({ youtubeList: data })).catch(() => {});
    fetchRecommendations().then(data => set({ recommends: data })).catch(() => {});
    fetchThemeCollections().then(data => set({ collections: data })).catch(() => {});
    
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
