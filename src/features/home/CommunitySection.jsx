import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Modal from '../../components/common/Modal';
import RecommendModalContent from './RecommendModalContent';
import navArrow from '../../assets/bottom-arrow.png';
import './CommunitySection.scss';

const DUMMY_DATA = [
  {
    id: 1,
    title: '🌿 여름 정주행 모음집 🌿',
    author: '김자바님 모음집',
    images: [
      'https://static.tvmaze.com/uploads/images/original_untouched/472/1182142.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/472/1181779.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/212/530351.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/484/1211756.jpg'
    ]
  },
  {
    id: 2,
    title: '2000년대 드라마가 최고지..*',
    author: '마이구미 제작님',
    images: [
      'https://static.tvmaze.com/uploads/images/original_untouched/442/1107293.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/434/1085235.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/576/1440521.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/342/855015.jpg'
    ]
  },
  {
    id: 3,
    title: '미드 좋아하는 사람 모여라~~~~',
    author: '솜사탕님',
    images: [
      'https://static.tvmaze.com/uploads/images/original_untouched/155/388140.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/1/4603.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/163/407941.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/67/169653.jpg'
    ]
  },
  {
    id: 4,
    title: '오늘 저녁 범죄도시',
    author: '검정색님 모음집',
    images: [
      'https://static.tvmaze.com/uploads/images/original_untouched/534/1337244.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/499/1247964.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/472/1181779.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/212/530351.jpg'
    ]
  },
  {
    id: 5,
    title: '🎬 영화관 가고 싶을 때 보는 영화 리스트',
    author: '시네마천국님',
    images: [
      'https://static.tvmaze.com/uploads/images/original_untouched/1/4603.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/155/388140.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/434/1085235.jpg',
      'https://static.tvmaze.com/uploads/images/original_untouched/484/1211756.jpg'
    ]
  }
];

const CommunitySection = () => {
  const [showModal, setShowModal] = useState(false);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className="community-section">
      <div className="section-header">
        <h2 className="section-title">유저 참여형 콘텐츠</h2>
        <div className="nav-buttons">
          <button ref={prevRef} className="nav-btn community-prev">
            <img src={navArrow} alt="Previous" />
          </button>
          <button ref={nextRef} className="nav-btn community-next">
            <img src={navArrow} alt="Next" style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      </div>

      <div className="slider-container">
        <Swiper
          modules={[Navigation]}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          navigation={true}
          spaceBetween={26}
          slidesPerView={1.5}
          breakpoints={{
            480: { slidesPerView: 1.8 },
            768: { slidesPerView: 2.2 },
            1024: { slidesPerView: 4 }
          }}
          className="community-swiper"
        >
          {DUMMY_DATA.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="community-card" onClick={() => setShowModal(true)}>
                <div className="image-group-box">
                  {item.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="sub-image"
                      style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }}
                    ></div>
                  ))}
                </div>
                <div className="info">
                  <h3 className="card-title">{item.title}</h3>
                  <span className="author-text">{item.author}</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <RecommendModalContent />
      </Modal>
    </section>
  );
};

export default CommunitySection;
