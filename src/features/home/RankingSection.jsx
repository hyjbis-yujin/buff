import { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import rankingArrow from '../../assets/icons/ranking-arrow.png';
import useContentNavigation from '../../hooks/useContentNavigation';
import { SLIDER_PRESETS } from '../../constants/sliderPresets';

// Components
import SectionHeader from '../../components/common/SectionHeader';
import PosterCard from '../../components/cards/PosterCard';
import { SkeletonBox } from '../../components/common/SkeletonAtom';

import './RankingSection.scss';

import useMediaRanking from '../../hooks/useMediaRanking';

const RankingSection = () => {
  const { goToDetail } = useContentNavigation();
  const { 
    platforms, 
    activePlatform, 
    currentData, 
    isLoading, 
    error, 
    handleTabClick, 
    retryFetch 
  } = useMediaRanking();

  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const tabsRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ isMoved: false, startX: 0, scrollLeft: 0 });

  // 탭 전환(activePlatform 변경) 시에만 slideTo(0, 0) 실행
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 0);
    }
  }, [activePlatform]);

  // 리사이즈 및 navigation 수동 연결
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    if (swiper.params && swiper.params.navigation) {
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
      swiper.navigation.destroy();
      swiper.navigation.init();
      swiper.navigation.update();
    }

    let rAFId = null;
    const handleResize = () => {
      if (rAFId) cancelAnimationFrame(rAFId);
      rAFId = requestAnimationFrame(() => {
        if (swiperRef.current) {
          swiperRef.current.update();
          if (swiperRef.current.navigation) {
            swiperRef.current.navigation.update();
          }
        }
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rAFId) cancelAnimationFrame(rAFId);
    };
  }, [currentData]);

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

  const renderContent = () => {
    if (error) {
      return (
        <div className="status-fallback error">
          <p>오늘의 인기 콘텐츠 정보를 불러오지 못했습니다.</p>
          <button className="retry-btn" onClick={retryFetch}>새로고침 시도 🔄</button>
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
        <button ref={prevRef} className="nav-btn prev-btn ranking-prev">
          <img src={rankingArrow} alt="Previous" />
        </button>
        
        <Swiper
          modules={[Navigation]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          navigation={{
            prevEl: '.ranking-prev',
            nextEl: '.ranking-next',
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
        
        <button ref={nextRef} className="nav-btn next-btn ranking-next">
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
          {platforms.map((platform) => (
            <button 
              key={platform.key}
              className={`tab-btn ${activePlatform.key === platform.key ? 'active' : ''}`}
              onClick={() => handleTabClick(platform, dragState.current.isMoved)}
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
