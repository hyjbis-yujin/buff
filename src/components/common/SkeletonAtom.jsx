// src/components/common/SkeletonAtom.jsx
import React from 'react';
import './SkeletonAtom.scss';

export const SkeletonBox = ({ width, height, borderRadius = '4px', className = '' }) => (
  <div 
    className={`skeleton-box pulse ${className}`}
    style={{ width, height, borderRadius }}
  />
);

export const SkeletonCircle = ({ size, className = '' }) => (
  <div 
    className={`skeleton-box skeleton-circle pulse ${className}`}
    style={{ width: size, height: size, borderRadius: '50%' }}
  />
);

export const SkeletonGrid = ({ count = 5, columns = 5, gap = '26px' }) => (
  <div 
    className="skeleton-grid"
    style={{ gap }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonBox 
        key={i} 
        className="sk-grid-item" 
        width={`calc((100% - (${gap} * ${columns - 1})) / ${columns})`}
        height="100%"
        aspectRatio="2/3"
        borderRadius="20px"
      />
    ))}
  </div>
);
