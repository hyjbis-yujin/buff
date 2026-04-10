import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import navArrow from '../../assets/bottom-arrow.png';
import './YoutubeSection.scss';

const DUMMY_DATA = [
  {
    id: 1,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/212/530351.jpg', 
    title: '가을배강은 핑계고 | EP.60',
    channel: '채널 십오야',
    views: '조회수 120만회'
  },
  {
    id: 2,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/442/1107293.jpg',
    title: '[10화 하이라이트] 나 다 보였지? 이제 내가 말해도 될까? | 이지연 마인드 | 살롱드립2',
    channel: 'TEO 테오',
    views: '조회수 85만회'
  },
  {
    id: 3,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/434/1085235.jpg',
    title: '올해 어쩔수없이 봐야하는 예능 1위 | 나영석의 와글와글',
    channel: '채널 십오야',
    views: '조회수 210만회'
  },
  {
    id: 4,
    image: 'https://static.tvmaze.com/uploads/images/original_untouched/534/1337244.jpg',
    title: '전소민의 런닝맨 마지막 인사 | 런닝맨 하이라이트',
    channel: 'SBS Running Man',
    views: '조회수 340만회'
  }
];

const YoutubeSection = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className="youtube-section">
      <div className="section-header">
        <h2 className="section-title">유튜브 오리지널 예능 콘텐츠</h2>
        <div className="nav-buttons">
          <button ref={prevRef} className="nav-btn youtube-prev">
            <img src={navArrow} alt="Previous" />
          </button>
          <button ref={nextRef} className="nav-btn youtube-next">
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
          slidesPerView={1.35} // 기존 1.5에서 하향
          breakpoints={{
            480: { slidesPerView: 1.6 },
            768: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3 }
          }}
          className="youtube-swiper"
        >
          {DUMMY_DATA.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="youtube-card">
                <div 
                  className="thumbnail"
                  style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover' }}
                ></div>
                <div className="info">
                  <h3 className="video-title">{item.title}</h3>
                  <div className="meta-info">
                    <span className="channel-icon"></span>
                    <span className="channel-name">{item.channel}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default YoutubeSection;
