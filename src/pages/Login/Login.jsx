import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/common/logo.png';
import { UI_TEXT } from '../../constants/uiText';
import './Login.scss';

const Login = () => {
  const [infoMessage, setInfoMessage] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setInfoMessage(UI_TEXT.LOGIN.PREPARING_SERVICE);
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <Link to="/">
          <img src={logo} alt="BUFF" className="panel-logo-img" />
        </Link>
        <form className="login-form" onSubmit={handleLoginSubmit}>
          <div className="input-group">
            <input 
              type="text" 
              placeholder={UI_TEXT.LOGIN.ID_PLACEHOLDER} 
              className="login-input" 
              aria-label="아이디"
            />
            <input 
              type="password" 
              placeholder={UI_TEXT.LOGIN.PW_PLACEHOLDER} 
              className="login-input" 
              aria-label="비밀번호"
            />
          </div>
          <button type="submit" className="login-submit-btn">
            {UI_TEXT.LOGIN.SUBMIT_BTN}
          </button>
          
          {infoMessage && (
            <p className="login-info-msg">
              {infoMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
