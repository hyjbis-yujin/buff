import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import wavveIcon from '../../assets/wavve.png';
import tvingIcon from '../../assets/tving.png';

const MODAL_DATA = [
  { id: 1, title: '나는 SOLO', tags: ['# 연애', '# 리얼리티'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/342/855015.jpg', platforms: [] },
  { id: 2, title: '놀면 뭐하니?', tags: ['# 예능', '# 최고재미'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/212/530351.jpg', platforms: [] },
  { id: 3, title: 'THE 시즌즈', tags: ['# 음악', '# 토크'], subtitle: '10CM의 쓰담쓰담', image: 'https://static.tvmaze.com/uploads/images/original_untouched/442/1107293.jpg', platforms: [wavveIcon, tvingIcon] },
  { id: 4, title: '콩심은데 콩나고 팥심은데 팥난다', tags: ['# 예능', '# 힐링'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/434/1085235.jpg', platforms: [] },
  { id: 5, title: '연인', tags: ['# 사극', '# 멜로'], image: 'https://static.tvmaze.com/uploads/images/original_untouched/472/1182142.jpg', platforms: [] },
];

const RecommendModalContent = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        // 실제 콘텐츠 높이가 컨테이너 높이보다 큰지 확인
        const isOverflowing = scrollRef.current.scrollHeight > scrollRef.current.clientHeight;
        setHasScroll(isOverflowing);
      }
    };

    checkScroll();
    // 윈도우 리사이즈 시에도 다시 체크
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <div className="recommend-modal-wrapper">
      <h2 className="modal-title">🌿 여름 정주행 모음집 🌿</h2>
      <div 
        ref={scrollRef} 
        className={`modal-poster-row ${hasScroll ? 'has-scrollbar' : ''}`}
      >
        {MODAL_DATA.map((item) => (
          <div 
            key={item.id} 
            className="poster-card"
            onClick={() => navigate(`/detail/${item.id}`)}
          >
            <div 
              className="poster-image" 
              style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover' }}
            ></div>
            
            {/* 시안의 3번째 카드처럼 오버레이 상시 노출 처리 */}
            <div className="overlay-info">
              {item.platforms && item.platforms.length > 0 && (
                <div className="top-icons">
                  {item.platforms.map((icon, idx) => (
                    <img key={idx} src={icon} alt="platform" className="platform-icon-img" />
                  ))}
                </div>
              )}
              <h3 className="overlay-title">
                {item.title}
                {item.subtitle && <span className="subtitle">{item.subtitle}</span>}
              </h3>
              <div className="tag-chips">
                {item.tags.map(tag => (
                  <span key={tag} className="tag-chip">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendModalContent;
