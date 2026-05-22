// src/components/overlay/OttIconList.jsx
import React from 'react';
import './OttIconList.scss';

const OttIconList = ({ providers }) => {
  // 유효한 로고 URL을 가진 provider만 필터링 (null 방지)
  const validProviders = providers.filter(p => p && p.logo && !p.logo.includes('null'));

  if (!validProviders || validProviders.length === 0) return null;

  return (
    <div className="ott-icon-list">
      {validProviders.map((p) => (
        <img
          key={p.id}
          src={p.logo}
          alt={p.name}
          className="ott-icon-img"
          title={p.name}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ))}
    </div>
  );
};

export default OttIconList;
