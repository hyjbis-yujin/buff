import { create } from 'zustand';

const useStore = create((set) => ({
  // 전역 상태가 꼭 필요한 로직의 뼈대
  counter: 0,
  increment: () => set((state) => ({ counter: state.counter + 1 })),
}));

export default useStore;
