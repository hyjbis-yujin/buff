import useStore from '../store/useStore';

/**
 * Hook to manage YouTube Curation logic
 */
const useYoutubeCuration = () => {
  const { youtubeList, isLoading, error, fetchHomeData } = useStore();

  return {
    videos: youtubeList,
    isLoading,
    error,
    retryFetch: fetchHomeData
  };
};

export default useYoutubeCuration;
