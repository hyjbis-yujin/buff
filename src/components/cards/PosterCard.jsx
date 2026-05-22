import React from 'react';
import PosterOverlay from '../overlay/PosterOverlay';
import RankingBadge from '../overlay/RankingBadge';
import './PosterCard.scss';
import '../overlay/PosterOverlay.scss';

import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { prefetchContentDetail } from '../../services/api/detailService';

const PosterCard = React.memo(({ 
  item, 
  onClick, 
  rank, 
  showRank = false,
  showOverlay = true,
  className = '' 
}) => {
  const [imageError, setImageError] = React.useState(false);

  if (!item || imageError) return null;

  const optimizedImage = getOptimizedImageUrl(item.image);

  const handleMouseEnter = () => {
    // Desktop only prefetch (hover)
    if (window.innerWidth >= 1024) {
      prefetchContentDetail(item.mediaType, item.id || item.tmdbId);
    }
  };

  const handleInternalClick = (e) => {
    // Mobile prefetch trigger (immediately on click)
    if (window.innerWidth < 1024) {
      prefetchContentDetail(item.mediaType, item.id || item.tmdbId);
    }
    if (onClick) onClick(e);
  };

  return (
    <div 
      className={`poster-card ${!showOverlay ? 'no-hover' : ''} ${className}`} 
      onClick={handleInternalClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* 이미지 로드 실패 감지용 숨김 태그 */}
      <img 
        src={optimizedImage} 
        alt={item.title || item.name} 
        style={{ display: 'none' }} 
        onError={() => setImageError(true)} 
      />
      <div 
        className="poster-image" 
        style={{ backgroundImage: `url(${optimizedImage})` }}
      ></div>
      
      {showOverlay && (
        <PosterOverlay 
          title={item.title || item.name}
          providers={item.providers}
          tags={item.tags}
        />
      )}
      
      {showRank && <RankingBadge rank={rank} />}
    </div>
  );
});

export default PosterCard;
