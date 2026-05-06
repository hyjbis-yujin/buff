import React, { Suspense, lazy } from 'react';
import HeroBanner from '../../features/home/HeroBanner';
import RankingSection from '../../features/home/RankingSection';
import RecommendSection from '../../features/home/RecommendSection';
import useHomeData from '../../hooks/useHomeData';
import './Home.scss';

// Lazy loaded sections
const YoutubeSection = lazy(() => import('../../features/home/YoutubeSection'));
const ThemeCollectionSection = lazy(() => import('../../features/home/ThemeCollectionSection'));

const Home = () => {
  // Priority 1: Parallel Fetching 트리거
  useHomeData();

  return (
    <div className="home-page container">
      <HeroBanner />
      <RankingSection />
      <RecommendSection />
      
      <Suspense fallback={<div className="section-loader" style={{ height: '300px' }}></div>}>
        <YoutubeSection />
      </Suspense>

      <Suspense fallback={<div className="section-loader" style={{ height: '300px' }}></div>}>
        <ThemeCollectionSection /> 
      </Suspense>
    </div>
  );
};

export default Home;
