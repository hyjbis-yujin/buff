// src/components/overlay/OttIconList.jsx
import React from 'react';
import './OttIconList.scss';

const OttIconList = ({ providers }) => {
  if (!providers || providers.length === 0) return null;

  return (
    <div className="ott-icon-list">
      {providers.map((p) => (
        <img
          key={p.id}
          src={p.logo}
          alt={p.name}
          className="ott-icon-img"
          title={p.name}
        />
      ))}
    </div>
  );
};

export default OttIconList;
