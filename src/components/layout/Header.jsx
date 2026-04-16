import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logo from '../../assets/common/logo.png';
import loginIcon from '../../assets/icons/login-icon.png';
import logoutIcon from '../../assets/icons/logout-icon.png';
import './Header.scss';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 페이지 여부 확인
  const isLoginPage = location.pathname === '/login';

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="BUFF" />
          </Link>
        </div>
        <div className="auth-buttons">
          {!isLoggedIn ? (
            // 로그인 페이지가 아닐 때만 로그인 버튼 표시
            !isLoginPage && (
              <button className="auth-btn login" onClick={() => navigate('/login')}>
                <img src={loginIcon} alt="Login" className="icon" />
                <span>로그인</span>
              </button>
            )
          ) : (
            <button className="auth-btn logout" onClick={() => setIsLoggedIn(false)}>
              <img src={logoutIcon} alt="Logout" className="icon" />
              <span>로그아웃</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
