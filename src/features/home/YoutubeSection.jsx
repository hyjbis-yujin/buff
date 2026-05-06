import { useState, useRef, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import navArrow from '../../assets/icons/bottom-arrow.png';
import { fetchYoutubeVideos } from '../../services/api/youtubeService';
import { SLIDER_PRESETS } from '../../constants/sliderPresets';

// Components
import SectionHeader from '../../components/common/SectionHeader';
import { SkeletonBox } from '../../components/common/SkeletonAtom';

import './YoutubeSection.scss';

import useYoutubeCuration from '../../hooks/useYoutubeCuration';

const YoutubeSection = () => {
  const { videos, isLoading, error, retryFetch } = useYoutubeCuration();

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const renderContent = () => {
    if (error) {
      return (
        <div className="status-fallback error">
          <p>유튜브 예능 정보를 불러오지 못했습니다.</p>
          <button className="retry-btn" onClick={retryFetch}>새로고침 시도 🔄</button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="slider-container loading">
          <div className="skeleton-cards">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card">
                <SkeletonBox className="skeleton-thumb" height="180px" borderRadius="20px" />
                <SkeletonBox className="skeleton-title" width="80%" height="24px" />
                <SkeletonBox className="skeleton-meta" width="40%" height="16px" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (videos.length === 0) {
      return (
        <div className="status-fallback empty">
          <p>오늘의 인기 유튜브 예능이 준비 중입니다.</p>
        </div>
      );
    }

    return (
      <div className="slider-container">
        <Swiper
          modules={[Navigation]}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          {...SLIDER_PRESETS.YOUTUBE}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          className="youtube-swiper"
        >
          {videos.map((item) => (
            <SwiperSlide key={item.videoId}>
              <div 
                className="youtube-card" 
                onClick={() => window.open(item.url, '_blank')}
              >
                <div 
                  className="thumbnail"
                  style={{ backgroundImage: `url(${item.thumbnail})` }}
                ></div>
                <div className="info">
                  <h3 className="video-title">{item.title}</h3>
                  <div className="meta-info">
                    <span 
                      className="channel-icon"
                      style={{ backgroundImage: `url(${item.channelImage})` }}
                    ></span>
                    <span className="channel-name">{item.channelName}</span>
                    <span className="view-count">{item.viewCount}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  };

  return (
    <section className="youtube-section">
      <SectionHeader title="유튜브 오리지널 예능 콘텐츠">
        <div className="nav-buttons">
          <button ref={prevRef} className="nav-btn youtube-prev">
            <img src={navArrow} alt="Previous" />
          </button>
          <button ref={nextRef} className="nav-btn youtube-next">
            <img src={navArrow} alt="Next" />
          </button>
        </div>
      </SectionHeader>

      {renderContent()}
    </section>
  );
};

export default YoutubeSection;
