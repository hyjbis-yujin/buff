import React from 'react';
import PosterOverlay from '../overlay/PosterOverlay';
import RankingBadge from '../overlay/RankingBadge';
import './PosterCard.scss';

const PosterCard = ({ 
  item, 
  onClick, 
  rank, 
  showRank = false,
  showOverlay = true,
  className = '' 
}) => {
  if (!item) return null;

  return (
    <div 
      className={`poster-card ${!showOverlay ? 'no-hover' : ''} ${className}`} 
      onClick={onClick}
    >
      <div 
        className="poster-image" 
        style={{ backgroundImage: `url(${item.image})` }}
      ></div>
      
      {showOverlay && (
        <PosterOverlay 
          title={item.title}
          providers={item.providers}
          tags={item.tags}
        />
      )}
      
      {showRank && <RankingBadge rank={rank} />}
    </div>
  );
};

export default PosterCard;
