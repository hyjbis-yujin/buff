import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Scrollbar, Mousewheel, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

import backIcon from '../../assets/icons/back-icon.png';
import wishIcon from '../../assets/icons/wish-icon.png';
import wishIconActive from '../../assets/icons/wish-icon-active.png';
import seenIcon from '../../assets/icons/seen-icon.png';
import seenIconActive from '../../assets/icons/seen-icon-active.png';

import { fetchContentDetail, fetchSimilarContent } from '../../services/api/detailService';
import useContentNavigation from '../../hooks/useContentNavigation';
import { SLIDER_PRESETS } from '../../constants/sliderPresets';

// Components
import SectionHeader from '../../components/common/SectionHeader';
import PosterCard from '../../components/cards/PosterCard';
import { SkeletonBox, SkeletonGrid } from '../../components/common/SkeletonAtom';

import './Detail.scss';

const Detail = () => {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const { goToDetail } = useContentNavigation();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(true);
  const [error, setError] = useState(null);

  const [isWished, setIsWished] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSeen, setIsSeen] = useState(false);
  const [isSeenHovered, setIsSeenHovered] = useState(false);

  const loadDetailData = useCallback(async () => {
    if (!id || !mediaType) return;
    
    try {
      setIsLoading(true);
      setIsLoadingSimilar(true);
      setError(null);

      // 1단계: 메인 정보(Hero) 우선 로드
      const heroResult = await fetchContentDetail(mediaType, id);
      setData(heroResult);
      setIsLoading(false); // Hero 정보 로드 완료 시 1차 렌더링

      // 2단계: 비슷한 콘텐츠 검증 로드 (백그라운드)
      if (heroResult.candidatePool) {
        const enrichedSimilar = await fetchSimilarContent(mediaType, heroResult.candidatePool);
        setData(prev => ({
          ...prev,
          similarContent: enrichedSimilar
        }));
      }
    } catch (err) {
      console.error('Failed to load detail:', err);
      setError(err);
      setIsLoading(false);
    } finally {
      setIsLoadingSimilar(false);
    }
  }, [id, mediaType]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadDetailData();
  }, [loadDetailData]);

  if (isLoading) {
    return (
      <div className="detail-page loading">
        <div className="container">
          <div className="skeleton-hero">
            <SkeletonBox className="skeleton-poster" width="300px" height="450px" borderRadius="20px" />
            <div className="skeleton-info">
              <SkeletonBox className="sk-title" width="60%" height="48px" />
              <div className="sk-tag-row">
                <SkeletonBox width="60px" height="28px" borderRadius="100px" />
                <SkeletonBox width="60px" height="28px" borderRadius="100px" />
                <SkeletonBox width="60px" height="28px" borderRadius="100px" />
              </div>
              <div className="sk-desc-row">
                <SkeletonBox width="100%" height="20px" />
                <SkeletonBox width="100%" height="20px" />
                <SkeletonBox width="80%" height="20px" />
              </div>
              <div className="sk-credits-row">
                <SkeletonBox width="40%" height="18px" />
                <SkeletonBox width="50%" height="18px" />
              </div>
              <div className="sk-ott-row">
                <SkeletonBox width="140px" height="46px" borderRadius="10px" />
                <SkeletonBox width="140px" height="46px" borderRadius="10px" />
              </div>
            </div>
          </div>
          <div className="skeleton-similar">
            <SkeletonBox className="sk-sec-title" width="300px" height="32px" />
            <SkeletonGrid count={5} columns={5} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="detail-page error">
        <div className="status-message">
          <p>콘텐츠 정보를 불러오지 못했습니다.</p>
          <button className="back-home-btn" onClick={() => navigate('/')}>메인으로 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <section className="hero-section">
        <div className="hero-visual-wrapper">
          <div 
            className="hero-background" 
            style={{ backgroundImage: `url(${data.backdrop || data.poster})` }}
          ></div>
          <div className="hero-overlay"></div>
        </div>
        
        <div className="container hero-content">
          <div className="top-nav">
            <button className="back-btn" onClick={() => navigate('/')}>
              <img src={backIcon} alt="메인으로 가기" />
            </button>

            <div className="action-area">
              <div className="top-actions">
                <button 
                  className={`action-btn ${isWished ? 'active' : ''}`}
                  onClick={() => setIsWished(!isWished)}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className="action-icon-wrapper">
                    <img 
                      src={(isWished || isHovered) ? wishIconActive : wishIcon} 
                      alt="찜하기" 
                      className="action-icon"
                    />
                  </div>
                  <span>찜하기</span>
                </button>
                <button 
                  className={`action-btn ${isSeen ? 'active' : ''}`}
                  onClick={() => setIsSeen(!isSeen)}
                  onMouseEnter={() => setIsSeenHovered(true)}
                  onMouseLeave={() => setIsSeenHovered(false)}
                >
                  <div className="action-icon-wrapper">
                    <img 
                      src={(isSeen || isSeenHovered) ? seenIconActive : seenIcon} 
                      alt="봤어요" 
                      className="action-icon"
                    />
                  </div>
                  <span>봤어요</span>
                </button>
              </div>
            </div>
          </div>

          <div className="main-info">
            <div className="poster-area">
              <img src={data.poster} alt={data.title} className="poster-img" />
            </div>

            <div className="text-info">
              <div className="title-row">
                <h1 className="title">{data.title}</h1>
              </div>
              
              <div className="tag-list">
                <span className="tag-pill"># {mediaType === 'movie' ? '영화' : 'TV'}</span>
                {data.genres.slice(0, 3).map(genre => (
                  <span key={genre} className="tag-pill"># {genre}</span>
                ))}
                {data.runtime !== '정보 없음' && (
                  <span className="tag-pill"># {data.runtime}</span>
                )}
              </div>

              <p className="description">
                {data.description}
              </p>

              <div className="credits">
                <p>감독 | {data.credits.director}</p>
                <p>출연진 | {data.credits.cast}</p>
                <p>개봉/방영일 | {data.releaseDate}</p>
              </div>

              <div className="ott-buttons">
                {data.providers.length > 0 ? (
                  data.providers.map(provider => (
                    <a 
                      key={provider.id} 
                      href={provider.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ott-btn"
                    >
                      <img src={provider.logo} alt={provider.name} className="ott-icon" />
                      <span className="ott-name">{provider.name}</span>
                      <svg className="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </a>
                  ))
                ) : (
                  <p className="no-providers">제공 중인 OTT 플랫폼 정보가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="similar-section">
        <div className="container">
          <SectionHeader title={`'${data.title}'와 비슷한 콘텐츠`} />
          
          {isLoadingSimilar ? (
            <div className="similar-skeleton-wrapper" style={{ marginTop: '2.4rem' }}>
              <SkeletonGrid count={5} columns={5} />
            </div>
          ) : data.similarContent.length > 0 ? (
            <div className="card-rail">
              <Swiper
                modules={[Navigation, Scrollbar, Mousewheel, FreeMode]}
                {...SLIDER_PRESETS.DETAIL_SIMILAR}
                grabCursor={true}
                mousewheel={true}
                scrollbar={{ draggable: true }}
              >
                {data.similarContent.map(item => (
                  <SwiperSlide key={item.id}>
                    <PosterCard 
                      item={item}
                      onClick={() => goToDetail(item.mediaType, item.id)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="no-similar-content">
              <p>현재 제공 가능한 비슷한 콘텐츠가 없어요.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Detail;
