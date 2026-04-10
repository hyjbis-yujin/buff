import React, { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import logo from '../../assets/logo.png';
import wavveIcon from '../../assets/wavve.png';
import tvingIcon from '../../assets/tving.png';
import backIcon from '../../assets/back-icon.png';
import wishIcon from '../../assets/wish-icon.png';
import wishIconActive from '../../assets/wish-icon-active.png';
import seenIcon from '../../assets/seen-icon.png';
import seenIconActive from '../../assets/seen-icon-active.png';
import './Detail.scss';

// 상세 페이지 실제 시안 데이터 (놀면뭐하니?)
const DETAIL_DATA = {
  id: 2,
  title: '놀면 뭐하니?',
  image: 'https://static.tvmaze.com/uploads/images/original_untouched/212/530351.jpg',
  tags: ['# 예능', '# 리얼 버라이어티', '# 2025', '# 15세'],
  description: '주말 휴일엔 뭐 먹고 쉴까? 유재석이 선사하는 리얼 버라이어티!\n매주 토요일 저녁을 책임지는 무한한 웃음의 세계로 당신을 초대합니다.',
  credits: {
    director: '김태호, 박창훈',
    cast: '유재석, 하하, 주우재, 박진주, 이이경, 미주'
  },
  similarContent: [
    { id: 101, title: '나는 SOLO', tags: ['# 연애', '# 리얼리티'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/342/855015.jpg' },
    { id: 102, title: 'THE 시즌즈', tags: ['# 음악', '# 토크쇼'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/442/1107293.jpg' },
    { id: 103, title: '경성크리처', tags: ['# 스릴러', '# 시대극'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/534/1337244.jpg' },
    { id: 104, title: '오징어 게임', tags: ['# 스릴러', '# 서바이벌'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/576/1440521.jpg' },
    { id: 105, title: '연인', tags: ['# 사극', '# 로맨스'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/472/1182142.jpg' }
  ]
};

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isWished, setIsWished] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isSeen, setIsSeen] = React.useState(false);
  const [isSeenHovered, setIsSeenHovered] = React.useState(false);

  // 페이지 진입 시 최상단으로 스크롤 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  
  // 현재는 데모용으로 고정 데이터를 사용 (id에 따라 데이터 확장 가능)
  const data = DETAIL_DATA;

  return (
    <div className="detail-page">
      {/* 상단 히어로 정보 영역 */}
      <section className="hero-section">
        <div className="hero-visual-wrapper">
          <div 
            className="hero-background" 
            style={{ backgroundImage: `url(${data.image})` }}
          ></div>
          <div className="hero-overlay"></div>
        </div>
        
        <div className="container hero-content">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <img src={backIcon} alt="뒤로가기" />
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

          <div className="main-info">
            <div className="poster-area">
              <img src={data.image} alt={data.title} className="poster-img" />
            </div>

            <div className="text-info">
              <h1 className="title">{data.title}</h1>
              
              <div className="tag-list">
                {data.tags.map(tag => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>

              <p className="description">
                {data.description.split('\n').map((line, i) => (
                  <span key={i}>{line}<br/></span>
                ))}
              </p>

              <div className="credits">
                <p>감독 | {data.credits.director}</p>
                <p>출연진 | {data.credits.cast}</p>
              </div>

              <div className="ott-buttons">
                <button className="ott-btn">
                  <img src={wavveIcon} alt="웨이브" className="ott-icon" />
                  <span className="ott-name">웨이브</span>
                  <svg className="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
                <button className="ott-btn">
                  <img src={tvingIcon} alt="티빙" className="ott-icon" />
                  <span className="ott-name">티빙</span>
                  <svg className="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 하단 비슷한 콘텐츠 섹션 */}
      <section className="similar-section">
        <div className="container">
          <h2 className="section-title">{data.title} 와 비슷한 콘텐츠</h2>
          <div className="card-rail">
            <Swiper
              modules={[Navigation]}
              spaceBetween={26}
              slidesPerView={2.2}
              breakpoints={{
                480: { slidesPerView: 2.5 },
                768: { slidesPerView: 4.5 },
                1024: { slidesPerView: 5 }
              }}
              style={{ overflow: 'visible' }}
            >
              {data.similarContent.map(item => (
                <SwiperSlide key={item.id}>
                  <div className="similar-card" onClick={() => navigate(`/detail/${item.id}`)}>
                    <img src={item.image} alt={item.title} />
                    <div className="overlay-info">
                      <h3 className="overlay-title">{item.title}</h3>
                      <div className="tag-chips">
                        {item.tags.map(tag => (
                          <span key={tag} className="tag-chip">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </div>
  );
};


export default Detail;
