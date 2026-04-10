import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Modal from '../../components/common/Modal';
import RecommendModalContent from './RecommendModalContent';
import sectionArrow from '../../assets/section-arrow.png';
import wavveIcon from '../../assets/wavve.png';
import tvingIcon from '../../assets/tving.png';
import netflixIcon from '../../assets/netflix.png';
import disneyIcon from '../../assets/disneyplus.png';
import coupangIcon from '../../assets/coupangplay.png';
import './RecommendSection.scss';

const PLATFORM_ICONS = {
  wavve: wavveIcon,
  tving: tvingIcon,
  netflix: netflixIcon,
  disney: disneyIcon,
  coupang: coupangIcon,
};

const DUMMY_DATA = [
  {
    id: 1,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/212/530351.jpg',
    platforms: [
      { id: 'wavve', label: 'W' },
      { id: 'tving', label: 'T' }
    ],
    title: '놀면뭐하니?',
    tags: ['# 예능', '# 최고 재미보장', '📺 프로그램'],
    description: '주말엔 뭐 먹고 쉴까? 멤버들의 좌충우돌 릴레이 콩트 완성!\n이번엔 어떤 기적 같은 프로젝트가 시작될까요?'
  },
  {
    id: 2,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/576/1440521.jpg',
    platforms: [{ id: 'netflix', label: 'N' }],
    title: '오징어 게임',
    tags: ['# 드라마', '# 서바이벌', '💰 명작'],
    description: '456억 원의 상금이 걸린 의문의 서바이벌에 참여한 사람들의 고군분투.'
  },
  {
    id: 3,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/163/407941.jpg',
    platforms: [
      { id: 'wavve', label: 'W' },
      { id: 'tving', label: 'T' }
    ],
    title: '눈물의 여왕',
    tags: ['# 로맨스', '# 드라마'],
    description: '퀸즈 그룹 재벌 3세 홍해인과 용두리 이장 아들 백현우의 아찔한 위기와 기적 같은 사랑.'
  },
  {
    id: 4,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/342/855015.jpg',
    platforms: [{ id: 'netflix', label: 'N' }],
    title: '피라미드 게임',
    tags: ['# 스릴러', '# 학원물'],
    description: '매월 한 명씩 F등급을 뽑아 합법적 왕따를 만드는 교실의 잔혹한 게임.'
  }
];

const RecommendSection = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const activeData = DUMMY_DATA[activeIndex] || DUMMY_DATA[0];

  return (
    <section className="recommend-section">
      <div className="recommend-header">
        <h3 className="section-label">당신이 좋아할 만한 추천작 <span className="icon-search">🔍</span></h3>
      </div>
      
      <div className="recommend-box">
        <div className="info-area">
          <div className="top-icons">
            {activeData.platforms.map(platform => (
              <img
                key={platform.id}
                src={PLATFORM_ICONS[platform.id]}
                alt={platform.id}
                className="platform-icon-img"
              />
            ))}
          </div>
          
          <h4 className="title">{activeData.title}</h4>
          
          <div className="chips">
            {activeData.tags.map((tag, idx) => (
              <span key={idx} className="chip">{tag}</span>
            ))}
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
            <button className="nav-btn prev-btn" onClick={(e) => e.stopPropagation()}>
              <img src={sectionArrow} alt="Previous" />
            </button>
            <button className="nav-btn next-btn" onClick={(e) => e.stopPropagation()}>
              <img src={sectionArrow} alt="Next" style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
        </div>

        <div className="poster-area">
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: '.recommend-section .prev-btn',
              nextEl: '.recommend-section .next-btn',
            }}
            spaceBetween={26}
            slidesPerView={3}
            watchSlidesProgress={true}
            breakpoints={{
              320: { slidesPerView: 1.5, spaceBetween: 12 },
              480: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 2.2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 26 }
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            className="poster-swiper"
          >
            {DUMMY_DATA.map((item, index) => (
              <SwiperSlide key={item.id}>
                <div 
                  className={`poster-card ${activeIndex === index ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover' }}
                  onClick={() => navigate(`/detail/${item.id}`)}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <RecommendModalContent />
      </Modal>
    </section>
  );
};

export default RecommendSection;
