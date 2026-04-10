import { useState, useRef, useEffect } from 'react';
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
  },
  {
    id: 5,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/434/1085235.jpg',
    platforms: [{ id: 'netflix', label: 'N' }],
    title: '콩콩팥팥',
    tags: ['# 예능', '# 힐링'],
    description: '어쩌다 사장 프로젝트 2탄! 콩 심은 데 콩 나고 팥 심은 데 팥 나는 리얼 농사 도전기.'
  },
  {
    id: 6,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/342/855015.jpg',
    platforms: [{ id: 'tving', label: 'T' }],
    title: '환승연애3',
    tags: ['# 리얼리티', '# 연애'],
    description: '다양한 이유로 이별한 커플들이 모여 지나간 사랑을 되짚고 새로운 사랑을 찾아가는 연애 리얼리티.'
  },
  {
    id: 7,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/223/559499.jpg',
    platforms: [{ id: 'disney', label: 'D' }],
    title: '무빙',
    tags: ['# 액션', '# 히어로'],
    description: '초능력을 숨긴 채 현재를 살아가는 아이들과 아픈 비밀을 숨긴 채 과거를 살아온 부모들의 이야기.'
  },
  {
    id: 8,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/425/1064739.jpg',
    platforms: [{ id: 'wavve', label: 'W' }],
    title: '모범택시',
    tags: ['# 범죄', '# 스릴러'],
    description: '베일에 가려진 무지개 운수가 억울한 피해자를 대신해 복수를 완성하는 사적 복수 대행극.'
  }
];

const RecommendSection = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const activeData = DUMMY_DATA[activeIndex] || DUMMY_DATA[0];

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // 반응형(slidesPerView)에 맞춰 추가할 빈 칸(dummy) 개수 계산 (항상 끝 카드까지 도달 보장)
  const [dummyCount, setDummyCount] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // 노출 개수에 따른 dummy 계산 (slidesPerView - 1)
      if (width >= 1200) setDummyCount(2); // slides: 3
      else if (width >= 950) setDummyCount(1); // slides: 2
      else if (width >= 768) setDummyCount(0); // slides: 1
      else setDummyCount(1); // mobile (vertical) slides: 2
    };
    
    handleResize(); // 초기화 시점 로드
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            <button ref={prevRef} className="nav-btn prev-btn" onClick={(e) => e.stopPropagation()}>
              <img src={sectionArrow} alt="Previous" />
            </button>
            <button ref={nextRef} className="nav-btn next-btn" onClick={(e) => e.stopPropagation()}>
              <img src={sectionArrow} alt="Next" style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
        </div>

        <div className="poster-area">
          <Swiper
            modules={[Navigation]}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            spaceBetween={26}
            slidesPerView={3}
            watchSlidesProgress={true}
            observer={true}
            observeParents={true}
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 16 }, // 모바일: 세로배열 2개
              768: { slidesPerView: 1, spaceBetween: 24 }, // 좁은 태블릿: 가로배치 1개
              950: { slidesPerView: 2, spaceBetween: 26 }, // 중간 넓이: 가로배치 2개
              1200: { slidesPerView: 3, spaceBetween: 26 } // 큰 화면: 가로배치 3개
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
            
            {/* 데이터 개수와 무관하게 무조건 마지막 카드까지 active(왼쪽)에 도달하도록 투명한 빈 공간 추가 */}
            {Array.from({ length: dummyCount }).map((_, idx) => (
              <SwiperSlide key={`dummy-${idx}`} style={{ pointerEvents: 'none', opacity: 0 }} />
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
