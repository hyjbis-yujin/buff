import React, { useEffect, useState } from 'react';
import closeIcon from '../../assets/modal-close.png';
import './Modal.scss';

const Modal = ({ isOpen, onClose, children }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 300); // 애니메이션 지속 시간과 맞춤
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // 스크롤 잠금 클린업 로직 분리 (html과 body 모두 제어)
  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add('no-scroll');
      document.body.classList.add('no-scroll');
    } else {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    }
    
    return () => {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`common-modal-overlay ${isClosing ? 'closing' : ''}`} 
      onClick={onClose}
    >
      <div 
        className={`modal-container ${isClosing ? 'closing' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          <img src={closeIcon} alt="닫기" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
