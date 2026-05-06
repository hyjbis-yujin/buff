import { useEffect } from 'react';
import useStore from '../store/useStore';

/**
 * Hook to trigger parallel home data fetching
 */
export const useHomeData = () => {
  const { fetchHomeData } = useStore();

  useEffect(() => {
    // 병렬로 호출하되, 개별 섹션이 완료되는 대로 화면에 그리도록 변경
    fetchHomeData();
  }, [fetchHomeData]);
};

export default useHomeData;
