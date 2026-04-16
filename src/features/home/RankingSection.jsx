import { useState, useRef, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import rankingArrow from '../../assets/icons/ranking-arrow.png';
import { fetchRankings } from '../../services/api/rankingService';
import useContentNavigation from '../../hooks/useContentNavigation';
import { PROVIDERS } from '../../constants/providers';
import { SLIDER_PRESETS } from '../../constants/sliderPresets';

// Components
import SectionHeader from '../../components/common/SectionHeader';
import PosterCard from '../../components/cards/PosterCard';
import { SkeletonBox } from '../../components/common/SkeletonAtom';

import './RankingSection.scss';

const PLATFORMS = Object.values(PROVIDERS).map(p => ({
  label: p.label,
  key: p.key
}));

const RankingSection = () => {
  const { goToDetail } = useContentNavigation();
  const [activePlatform, setActivePlatform] = useState(PLATFORMS[0]); // {label, key}
  const [rankingData, setRankingData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const tabsRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ isMoved: false, startX: 0, scrollLeft: 0 });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchRankings();
      setRankingData(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 0);
    }
  }, [activePlatform]);

  // Tab Drag Logic
  const onDragStart = (e) => {
    setIsDragging(true);
    dragState.current.isMoved = false;
    dragState.current.startX = e.pageX;
    dragState.current.scrollLeft = tabsRef.current.scrollLeft;
  };
  const onDragEnd = () => setIsDragging(false);
  const onDragMove = (e) => {
    if (!isDragging) return;
    dragState.current.isMoved = true;
    e.preventDefault();
    const walk = (e.pageX - dragState.current.startX) * 2;
    tabsRef.current.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const handleTabClick = (platform) => {
    if (dragState.current.isMoved) return;
    setActivePlatform(platform);
  };

  const currentData = rankingData[activePlatform.key] || [];

  const renderContent = () => {
    if (error) {
      return (
        <div className="status-fallback error">
          <p>오늘의 인기 콘텐츠 정보를 불러오지 못했습니다.</p>
          <button className="retry-btn" onClick={loadData}>새로고침 시도 🔄</button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="slider-container loading">
          <div className="skeleton-cards">
            {[1, 2, 3, 4, 5].map(i => (
              <SkeletonBox key={i} className="sk-card" borderRadius="20px" />
            ))}
          </div>
        </div>
      );
    }

    if (currentData.length === 0) {
      return (
        <div className="status-fallback empty">
          <p>해당 플랫폼의 오늘의 인기 콘텐츠가 준비 중입니다.</p>
        </div>
      );
    }

    return (
      <div className="slider-container">
        <button ref={prevRef} className="nav-btn prev-btn">
          <img src={rankingArrow} alt="Previous" />
        </button>
        
        <Swiper
          modules={[Navigation]}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            if (swiper.params.navigation) {
              swiper.navigation.init();
              swiper.navigation.update();
            }
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          {...SLIDER_PRESETS.RANKING}
          className="ranking-swiper"
          observer={true}
          observeParents={true}
        >
          {currentData.map((item, index) => (
            <SwiperSlide key={item.id}>
              <PosterCard 
                item={item}
                rank={index + 1}
                showRank={true}
                onClick={() => goToDetail(item.mediaType, item.id)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        
        <button ref={nextRef} className="nav-btn next-btn">
          <img src={rankingArrow} alt="Next" />
        </button>
      </div>
    );
  };

  return (
    <section className="ranking-section">
      <SectionHeader title="플랫폼별 오늘의 인기 콘텐츠">
        <div 
          className="platform-tabs"
          ref={tabsRef}
          onMouseDown={onDragStart}
          onMouseLeave={onDragEnd}
          onMouseUp={onDragEnd}
          onMouseMove={onDragMove}
        >
          {PLATFORMS.map((platform) => (
            <button 
              key={platform.key}
              className={`tab-btn ${activePlatform.key === platform.key ? 'active' : ''}`}
              onClick={() => handleTabClick(platform)}
              draggable={false}
            >
              {platform.label}
            </button>
          ))}
        </div>
      </SectionHeader>

      {renderContent()}
    </section>
  );
};

export default RankingSection;
