import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import arrow from '../../assets/icons/hero-arrow.png';
import banner01 from '../../assets/images/banner_260415_01.jpg';
import banner02 from '../../assets/images/banner_260415_02.jpg';
import banner03 from '../../assets/images/banner_260415_03.jpg';
import useContentNavigation from '../../hooks/useContentNavigation';
import './HeroBanner.scss';

const DUMMY_DATA = [
  {
    id: '128995', // 유미의 세포들 (Yumi's Cells)
    image: banner01,
    title: '유미의 세포들 3',
    desc: '세포들과 함께하는 유미의 새로운 사랑과 도전! 티빙 독점 선공개.',
    mediaType: 'tv',
    position: 'center'
  },
  {
    id: '289424', // 모두가 자신의 무가치함과 싸우고 있다 (최신작)
    image: banner02,
    title: '모두가 자신의 무가치함과 싸우고 있다',
    desc: '잘난 친구들 사이에서 혼자만 안 풀려 괴로워하던 한 남자의 평화 찾기 프로젝트.',
    mediaType: 'tv',
    position: 'center'
  },
  {
    id: '281010', // 그녀는 죽었다
    image: banner03,
    title: '그녀는 죽었다',
    desc: '한 남자가 관찰하던 여자의 죽음을 목격하고, 살인자의 누명을 벗기 위해 그녀의 비밀 속으로 들어가는 미스터리 추적 스릴러.',
    mediaType: 'tv',
    position: 'center'
  }
];

const HeroBanner = () => {
  const { goToDetail } = useContentNavigation();
  const swiperInstance = useRef(null);

  const handleBannerClick = (item) => {
    // Swiper가 드래그(이동)된 상태가 아닐 때만 상세 페이지로 이동
    if (swiperInstance.current && !swiperInstance.current.moved) {
      goToDetail(item.mediaType, item.id);
    }
  };

  return (
    <section className="hero-banner">
      <Swiper
        modules={[Pagination, Autoplay, Navigation]}
        onSwiper={(swiper) => (swiperInstance.current = swiper)}
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
            <div className="banner-slide" onClick={() => handleBannerClick(item)}>
              <img
                src={item.image}
                alt={item.title}
                className="banner-img"
                style={{ objectPosition: item.position || 'center' }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button className="nav-btn prev-btn">
        <img src={arrow} alt="Previous" />
      </button>
      <button className="nav-btn next-btn">
        <img src={arrow} alt="Next" />
      </button>
    </section>
  );
};

export default HeroBanner;
