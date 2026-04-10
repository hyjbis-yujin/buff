import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import rankingArrow from '../../assets/ranking-arrow.png';
import wavveIcon from '../../assets/wavve.png';
import tvingIcon from '../../assets/tving.png';
import netflixIcon from '../../assets/netflix.png';
import disneyIcon from '../../assets/disneyplus.png';
import coupangIcon from '../../assets/coupangplay.png';
import './RankingSection.scss';

const PLATFORM_ICONS = {
  '넷플릭스': netflixIcon,
  '티빙': tvingIcon,
  '웨이브': wavveIcon,
  '디즈니+': disneyIcon,
  '쿠팡플레이': coupangIcon,
};

const PLATFORMS = ['넷플릭스', '티빙', '웨이브', '디즈니+', '쿠팡플레이'];

const PLATFORM_DATA = {
  '넷플릭스': [
    { id: 1, title: '나는 SOLO', tags: ['# 연애', '# 리얼리티'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/342/855015.jpg' },
    { id: 2, title: '놀면 뭐하니?', tags: ['# 예능', '# 최고재미'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/212/530351.jpg' },
    { id: 3, title: 'THE 시즌즈', tags: ['# 음악', '# 토크쇼'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/442/1107293.jpg' },
    { id: 4, title: '콩콩팥팥', tags: ['# 예능', '# 힐링'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/434/1085235.jpg' },
    { id: 5, title: '나는 SOLO', tags: ['# 연애', '# 리얼리티'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/342/855015.jpg' },
    { id: 6, title: '오징어 게임', tags: ['# 스릴러', '# 서바이벌'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/576/1440521.jpg' }
  ],
  '티빙': [
    { id: 11, title: '환승연애3', tags: ['# 연애', '# 리얼리티'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/442/1107293.jpg' }
  ],
  '웨이브': [
    { id: 21, title: '연인', tags: ['# 사극', '# 멜로'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/472/1182142.jpg' }
  ],
  '디즈니+': [
    { id: 31, title: '무빙', tags: ['# 초능력', '# 히어로'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/472/1181779.jpg' }
  ],
  '쿠팡플레이': [
    { id: 41, title: '소년시대', tags: ['# 코미디', '# 드라마'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/484/1211756.jpg' }
  ]
};

const RankingSection = () => {
  const navigate = useNavigate();
  const [activePlatform, setActivePlatform] = useState('넷플릭스');

  const tabsRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onDragStart = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - tabsRef.current.offsetLeft);
    setScrollLeft(tabsRef.current.scrollLeft);
  };
  const onDragEnd = () => setIsDragging(false);
  const onDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tabsRef.current.scrollLeft = scrollLeft - walk;
  };

  const currentData = PLATFORM_DATA[activePlatform] || [];

  return (
    <section className="ranking-section">
      <div className="section-header">
        <h2 className="section-title">플랫폼별 실시간 인기 콘텐츠</h2>
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
              key={platform}
              className={`tab-btn ${activePlatform === platform ? 'active' : ''}`}
              onClick={() => setActivePlatform(platform)}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      <div className="slider-container">
        <button className="nav-btn prev-btn">
          <img src={rankingArrow} alt="Previous" />
        </button>
        
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: '.ranking-section .prev-btn',
            nextEl: '.ranking-section .next-btn',
          }}
          spaceBetween={26}
          slidesPerView={2.2}
          breakpoints={{
            768: { slidesPerView: 3.5 },
            1024: { slidesPerView: 5 }
          }}
          className="ranking-swiper"
        >
          {currentData.map((item, index) => (
            <SwiperSlide key={item.id}>
              <div className="poster-card" onClick={() => navigate(`/detail/${item.id}`)}>
                <div className="poster-image" style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover' }}></div>
                <div className="overlay-info">
                  <div className="top-icons">
                    <img
                      src={PLATFORM_ICONS[activePlatform]}
                      alt={activePlatform}
                      className="platform-icon-img"
                    />
                  </div>
                  <h3 className="overlay-title">{item.title}</h3>
                  <div className="tag-chips">
                    {item.tags.map(tag => (
                      <span key={tag} className="tag-chip">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="ranking-number">{index + 1}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        <button className="nav-btn next-btn">
          <img src={rankingArrow} alt="Next" style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
    </section>
  );
};

export default RankingSection;
