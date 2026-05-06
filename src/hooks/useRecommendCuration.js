import useStore from '../store/useStore';

/**
 * Hook to manage Recommendation Section logic
 */
const useRecommendCuration = () => {
  const { recommends, isLoading, error, fetchHomeData } = useStore();

  return {
    recommendList: recommends,
    isLoading,
    error,
    retryFetch: fetchHomeData
  };
};

export default useRecommendCuration;
