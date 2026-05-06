import useStore from '../store/useStore';

/**
 * Hook to manage Theme Collection logic
 */
const useThemeCollection = () => {
  const { collections, isLoading, error, fetchHomeData } = useStore();

  return {
    collections,
    isLoading,
    error,
    retryFetch: fetchHomeData
  };
};

export default useThemeCollection;
