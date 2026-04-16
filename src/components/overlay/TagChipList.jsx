// src/components/overlay/TagChipList.jsx
import React from 'react';
import './TagChipList.scss';

const TagChipList = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="tag-chip-list">
      {tags.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
        </span>
      ))}
    </div>
  );
};

export default TagChipList;
