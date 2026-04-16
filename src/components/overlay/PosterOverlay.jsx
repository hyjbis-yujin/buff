// src/components/overlay/PosterOverlay.jsx
import React from 'react';
import OttIconList from './OttIconList';
import TagChipList from './TagChipList';
import './PosterOverlay.scss';

const PosterOverlay = ({ title, providers, tags }) => {
  return (
    <div className="poster-overlay">
      <div className="top-area">
        <OttIconList providers={providers} />
      </div>
      <h3 className="overlay-title">{title}</h3>
      <div className="bottom-area">
        <TagChipList tags={tags} />
      </div>
    </div>
  );
};

export default PosterOverlay;
