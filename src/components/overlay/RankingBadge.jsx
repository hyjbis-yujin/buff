// src/components/overlay/RankingBadge.jsx
import React from 'react';
import './RankingBadge.scss';

const RankingBadge = ({ rank }) => {
  if (rank === undefined || rank === null) return null;

  return <div className="ranking-badge">{rank}</div>;
};

export default RankingBadge;
