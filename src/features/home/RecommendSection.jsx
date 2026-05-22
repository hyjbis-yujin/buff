import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import Modal from '../../components/common/Modal';
import RecommendModalContent from './RecommendModalContent';
import sectionArrow from '../../assets/icons/section-arrow.png';
import useContentNavigation from '../../hooks/useContentNavigation';
import { SLIDER_PRESETS } from '../../constants/sliderPresets';
import useRecommendCuration from '../../hooks/useRecommendCuration';

// Components
import SectionHeader from '../../components/common/SectionHeader';
import PosterCard from '../../components/cards/PosterCard';
import OttIconList from '../../components/overlay/OttIconList';
import TagChipList from '../../components/overlay/TagChipList';
import { SkeletonBox } from '../../components/common/SkeletonAtom';

import './RecommendSection.scss';

const RecommendSection = () => {
  const { goToDetail } = useContentNavigation();
  const { recommendList, isLoading, error, retryFetch } = useRecommendCuration();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const swiperRef = useRef(null);

  const activeData = recommendList[activeIndex];

  const handleNext = (e) => {
    e.stopPropagation();
    if (!swiperRef.current) return;
    const swiper = swiperRef.current;
    
    // 슬라이더가 끝에 도달했더라도 마지막까지 데이터가 넘어가도록 처리
    if (swiper.isEnd) {
      if (activeIndex < recommendList.length - 1) {
        setActiveIndex(prev => prev + 1);
      }
    } else {
      swiper.slideNext();
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (!swiperRef.current) return;
    const swiper = swiperRef.current;

    // 인덱스가 현재 활성화된 슬라이드보다 크면 인덱스만 먼저 감소
    if (activeIndex > swiper.activeIndex) {
      setActiveIndex(prev => prev - 1);
    } else {
      swiper.slidePrev();
    }
  };

  const handlePosterClick = (item, index) => {
    // 이미 활성화된 카드 클릭 시 상세로 이동
    if (activeIndex === index) {
      goToDetail(item.mediaType, item.tmdbId);
    } else {
      // 비활성 카드 클릭 시 해당 카드가 포함된 위치로 슬라이드 이동 및 활성화
      setActiveIndex(index);
      if (swiperRef.current) {
        swiperRef.current.slideTo(index);
      }
    }
  };


  const renderContent = () => {
    if (error) {
      return (
        <div className="status-fallback error">
          <p>추천작 메타데이터를 불러오지 못했습니다.</p>
          <button className="retry-btn" onClick={retryFetch}>새로고침 시도 🔄</button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <>
          <div className="info-area loading-placeholder">
            <SkeletonBox width="60%" height="40px" className="title-skeleton" />
            <SkeletonBox width="40%" height="24px" className="chips-skeleton" />
            <SkeletonBox width="100%" height="60px" className="desc-skeleton" />
          </div>
          <div className="poster-area loading-placeholder">
            <div className="skeleton-row">
              <SkeletonBox className="sk-item" borderRadius="20px" />
              <SkeletonBox className="sk-item" borderRadius="20px" />
              <SkeletonBox className="sk-item desktop-only" borderRadius="20px" />
            </div>
          </div>
        </>
      );
    }

    if (recommendList.length === 0 || !activeData) {
      return (
        <div className="status-fallback empty">
          <p>조건에 부합하는 추천 작품이 없습니다.</p>
        </div>
      );
    }

    return (
      <>
        <div className="info-area">
          <div className="top-icons">
            <OttIconList providers={activeData.providers} />
          </div>
          
          <h4 className="title">{activeData.title}</h4>
          
          <div className="chips">
            <TagChipList tags={activeData.tags} variant="recommend" />
          </div>
          
          <p className="description">
            {activeData.description.split('\n').map((line, idx) => (
              <span key={idx}>
                {line}
                {idx < activeData.description.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>

          <div className="nav-buttons">
            <button className="nav-btn prev-btn" onClick={handlePrev}>
              <img src={sectionArrow} alt="Previous" />
            </button>
            <button className="nav-btn next-btn" onClick={handleNext}>
              <img src={sectionArrow} alt="Next" />
            </button>
          </div>
        </div>

        <div className="poster-area">
          <Swiper
            modules={[Navigation]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            {...SLIDER_PRESETS.RECOMMEND}
            grabCursor={true}
            watchSlidesProgress={true}
            observer={true}
            observeParents={true}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            className="poster-swiper"
          >
             {recommendList.map((item, index) => (
              <SwiperSlide key={item.id}>
                <PosterCard 
                  item={item}
                  showOverlay={false}
                  className={activeIndex === index ? 'active' : ''}
                  onClick={() => handlePosterClick(item, index)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </>
    );
  };

  return (
    <section className="recommend-section">
      <SectionHeader title={
        <span className="label-with-icon">
          당신이 좋아할 만한 추천작 <span className="icon-search">🔍</span>
        </span>
      } />
      
      <div className="recommend-box">
        {renderContent()}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <RecommendModalContent />
      </Modal>
    </section>
  );
};

export default RecommendSection;
