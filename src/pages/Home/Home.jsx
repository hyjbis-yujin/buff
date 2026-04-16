import HeroBanner from '../../features/home/HeroBanner';
import RankingSection from '../../features/home/RankingSection';
import RecommendSection from '../../features/home/RecommendSection';
import YoutubeSection from '../../features/home/YoutubeSection';
import ThemeCollectionSection from '../../features/home/ThemeCollectionSection';
import './Home.scss';

const Home = () => {
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
