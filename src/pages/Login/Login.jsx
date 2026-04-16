import { Link } from 'react-router-dom';
import logo from '../../assets/common/logo.png';
import './Login.scss';

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-panel">
        <Link to="/">
          <img src={logo} alt="BUFF" className="panel-logo-img" />
        </Link>
        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="아이디를 입력하세요." 
              className="login-input" 
              aria-label="아이디"
            />
            <input 
              type="password" 
              placeholder="비밀번호를 입력하세요." 
              className="login-input" 
              aria-label="비밀번호"
            />
          </div>
          <button type="submit" className="login-submit-btn">로그인</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
