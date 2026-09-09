// src/components/common/SkeletonAtom.jsx
import React from 'react';
import './SkeletonAtom.scss';

// borderRadius를 넘기지 않으면 인라인 style이 붙지 않아 SCSS 쪽에서 브레이크포인트별로
// 라운드값을 제어할 수 있다. 기본값 4px은 SkeletonAtom.scss의 .skeleton-box에 정의.
export const SkeletonBox = ({ width, height, borderRadius, className = '' }) => (
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
