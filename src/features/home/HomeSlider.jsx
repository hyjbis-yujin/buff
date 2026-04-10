import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import './HomeSlider.scss';

const HomeSlider = () => {
  return (
    <Swiper className="home-slider" spaceBetween={50} slidesPerView={1}>
      <SwiperSlide><div className="slide-box">Slide 예제 1</div></SwiperSlide>
      <SwiperSlide><div className="slide-box">Slide 예제 2</div></SwiperSlide>
    </Swiper>
  );
};

export default HomeSlider;
