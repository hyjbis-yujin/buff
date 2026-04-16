import { useState, useEffect, useRef } from 'react';
import useContentNavigation from '../../hooks/useContentNavigation';
import PosterCard from '../../components/cards/PosterCard';

const RecommendModalContent = ({ collection }) => {
  const { goToDetail } = useContentNavigation();
  const scrollRef = useRef(null);
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const isOverflowing = scrollRef.current.scrollHeight > scrollRef.current.clientHeight;
        setHasScroll(isOverflowing);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [collection]);

  if (!collection) return null;

  return (
    <div className="recommend-modal-wrapper">
      <h2 className="modal-title">{collection.title}</h2>
      <div 
        ref={scrollRef} 
        className={`modal-poster-row ${hasScroll ? 'has-scrollbar' : ''}`}
      >
        {collection.items.map((item) => (
          <PosterCard
            key={item.id}
            item={item}
            onClick={() => goToDetail(item.mediaType, item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendModalContent;
