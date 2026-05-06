import { useState, useCallback, useMemo } from 'react';
import useStore from '../store/useStore';
import { PROVIDERS } from '../constants/providers';

const PLATFORMS = Object.values(PROVIDERS).map(p => ({
  label: p.label,
  key: p.key
}));

/**
 * Hook to manage Media Ranking logic (platform tabs, data selection)
 */
const useMediaRanking = () => {
  const { rankings, isLoading, error, refreshRankings } = useStore();
  const [activePlatform, setActivePlatform] = useState(PLATFORMS[0]);

  const handleTabClick = useCallback((platform, isMoved) => {
    if (isMoved) return;
    setActivePlatform(platform);
  }, []);

  const currentData = useMemo(() => {
    return rankings[activePlatform.key] || [];
  }, [rankings, activePlatform.key]);

  return {
    platforms: PLATFORMS,
    activePlatform,
    currentData,
    isLoading,
    error,
    handleTabClick,
    retryFetch: refreshRankings
  };
};

export default useMediaRanking;
