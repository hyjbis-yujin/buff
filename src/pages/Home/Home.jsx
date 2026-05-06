import React, { Suspense, lazy } from 'react';
import HeroBanner from '../../features/home/HeroBanner';
import RankingSection from '../../features/home/RankingSection';
import RecommendSection from '../../features/home/RecommendSection';
import useHomeData from '../../hooks/useHomeData';
import './Home.scss';

import YoutubeSection from '../../features/home/YoutubeSection';
import ThemeCollectionSection from '../../features/home/ThemeCollectionSection';

const Home = () => {
  // Priority 1: Parallel Fetching 트리거
  useHomeData();

  return (
    <div className="home-page container">
      <HeroBanner />
      <RankingSection />
      <RecommendSection />
      
      <YoutubeSection />

      <ThemeCollectionSection /> 
    </div>
  );
};

export default Home;
