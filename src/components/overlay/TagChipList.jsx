// src/components/overlay/TagChipList.jsx
import React from 'react';
import './TagChipList.scss';

const TagChipList = ({ tags, variant = 'default' }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="tag-chip-list">
      {tags.map((tag) => (
        <span key={tag} className={`tag-chip variant-${variant}`}>
          {tag}
        </span>
      ))}
    </div>
  );
};

export default TagChipList;
