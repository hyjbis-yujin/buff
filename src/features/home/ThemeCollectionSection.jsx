import { useState, useRef, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import Modal from '../../components/common/Modal';
import RecommendModalContent from './RecommendModalContent';
import navArrow from '../../assets/icons/bottom-arrow.png';
import { SLIDER_PRESETS } from '../../constants/sliderPresets';
import useThemeCollection from '../../hooks/useThemeCollection';

// Components
import SectionHeader from '../../components/common/SectionHeader';
import { SkeletonBox } from '../../components/common/SkeletonAtom';

import './ThemeCollectionSection.scss';

const ThemeCollectionSection = () => {
  const { collections, isLoading, error, retryFetch } = useThemeCollection();
  const [showModal, setShowModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  const prevRef = useRef(null);
  const nextRef = useRef(null);


  const renderContent = () => {
    if (error) {
      return (
        <div className="status-fallback error">
          <p>테마 컬렉션 정보를 불러오지 못했습니다.</p>
          <button className="retry-btn" onClick={retryFetch}>새로고침 시도 🔄</button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="slider-container loading">
          <div className="skeleton-cards">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-card">
                <SkeletonBox className="skeleton-image-grid" height="180px" borderRadius="15px" />
                <SkeletonBox className="skeleton-info" width="70%" height="24px" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (collections.length === 0) {
      return (
        <div className="status-fallback empty">
          <p>오늘의 테마 추천 컬렉션이 준비 중입니다.</p>
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
          {...SLIDER_PRESETS.THEME_COLLECTION}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          className="theme-collection-swiper"
        >
          {collections.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="theme-card" onClick={() => {
                setSelectedCollection(item);
                setShowModal(true);
              }}>
                <div className="image-group-box">
                  {item.items.slice(0, 4).map((subItem, idx) => (
                    <div 
                      key={idx} 
                      className="sub-image"
                      style={{ 
                        backgroundImage: `url(${subItem.image})`
                      }}
                    ></div>
                  ))}
                </div>
                <div className="info">
                  <h3 className="card-title">{item.title}</h3>
                  <div className="author-row">
                    {item.authorType === 'official' && <span className="official-badge">BUFF</span>}
                    <span className="author-text">{item.author}</span>
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
    <section className="theme-collection-section">
      <SectionHeader title="테마별 추천 컬렉션">
        <div className="nav-buttons">
          <button ref={prevRef} className="nav-btn theme-prev">
            <img src={navArrow} alt="Previous" />
          </button>
          <button ref={nextRef} className="nav-btn theme-next">
            <img src={navArrow} alt="Next" />
          </button>
        </div>
      </SectionHeader>

      {renderContent()}

      <Modal isOpen={showModal} onClose={() => {
        setShowModal(false);
        setSelectedCollection(null);
      }}>
        <RecommendModalContent collection={selectedCollection} />
      </Modal>
    </section>
  );
};

export default ThemeCollectionSection;
