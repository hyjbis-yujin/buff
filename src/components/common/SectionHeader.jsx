// src/components/common/SectionHeader.jsx
import React from 'react';
import './SectionHeader.scss';

const SectionHeader = ({ title, children, className = '' }) => {
  return (
    <div className={`section-header ${className}`}>
      <h2 className="section-title">{title}</h2>
      {children}
    </div>
  );
};

export default SectionHeader;
