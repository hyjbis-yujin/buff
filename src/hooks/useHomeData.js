import { useEffect } from 'react';
import useStore from '../store/useStore';

/**
 * Hook to trigger parallel home data fetching
 */
const useHomeData = () => {
  const { fetchHomeData, isLoading, error, isInitialized } = useStore();

  useEffect(() => {
    // 페이지 진입 시 데이터 수집 시작 (Zustand 내부에서 중복 방지 처리됨)
    fetchHomeData();
  }, [fetchHomeData]);

  return { isLoading, error, isInitialized };
};

export default useHomeData;
