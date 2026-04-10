import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import arrow from '../../assets/hero-arrow.png';
import './HeroBanner.scss';

const DUMMY_DATA = [
  {
    id: 1,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/534/1337244.jpg',
    title: '경성크리처 시즌 2',
    desc: '1945년 경성, 탐욕 위에 탄생한 괴물과 맞서는 두 청춘의 사투.'
  },
  {
    id: 2,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/576/1440521.jpg',
    title: '오징어 게임 시즌 3',
    desc: '다시 시작된 게임. 이번엔 누가 살아남을 수 있을까?'
  }
];

const HeroBanner = () => {
  return (
    <section className="hero-banner">
      <Swiper
        modules={[Pagination, Autoplay, Navigation]}
        pagination={{ clickable: true }}
        navigation={{
          prevEl: '.hero-banner .prev-btn',
          nextEl: '.hero-banner .next-btn',
        }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        slidesPerView={1}
        className="hero-swiper"
      >
        {DUMMY_DATA.map((item) => (
          <SwiperSlide key={item.id}>
            <div 
              className="slide-image-placeholder"
              style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '100%', height: '100%' }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      <button className="nav-btn prev-btn">
        <img src={arrow} alt="Previous" />
      </button>
      <button className="nav-btn next-btn">
        <img src={arrow} alt="Next" style={{ transform: 'rotate(180deg)' }} />
      </button>
    </section>
  );
};

export default HeroBanner;
