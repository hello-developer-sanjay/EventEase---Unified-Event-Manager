import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../../store/slices/eventpro/authSlice';
import styled, { keyframes } from 'styled-components';
import { RingLoader } from 'react-spinners';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: url('https://sanjaybasket.s3.ap-south-1.amazonaws.com/background.webp') no-repeat center center fixed;
  background-size: cover;
`;

const LoginForm = styled.form`
  background: linear-gradient(135deg, #3a3a3a, #1e1e1e);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  max-width: 400px;
  width: 100%;
  transform: perspective(1000px) rotateY(10deg);
  transition: transform 0.5s ease, box-shadow 0.5s ease;
  &:hover {
    transform: perspective(1000px) rotateY(0);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  }
`;

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Title = styled.h2`
  font-family: 'Cinzel Decorative', cursive;
  color: #d4af37;
  text-align: center;
  margin-bottom: 2rem;
  animation: ${fadeIn} 1s ease-in-out;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

const Input = styled.input`
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 2px solid #d4af37;
  border-radius: 10px;
  font-size: 1rem;
  width: 100%;
  background-color: #2a2a2a;
  color: #fff;
  transition: border-color 0.3s, box-shadow 0.3s;
  &:focus {
    border-color: #d4af37;
    outline: none;
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #d4af37;
  color: black;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
  &:hover {
    background-color: #e5c370;
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
`;

const GoogleButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #db4437;
  color: white;
  &:hover {
    background-color: #c23321;
  }
`;

const GoogleIcon = styled(FontAwesomeIcon)`
  margin-right: 0.5rem;
`;

const PasswordContainer = styled.div`
  position: relative;
`;

const ToggleIcon = styled(FontAwesomeIcon)`
  position: absolute;
  right: 10px;
  top: 35%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #d4af37;
`;

const SignInSignUp = ({ platform }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error } = useSelector((state) => state.eventpro.auth);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const { email, password } = formData;

  useEffect(() => {
    console.log('SignInSignUp.jsx - Checking auth:', { isAuthenticated, platform });
    if (isAuthenticated) {
      console.log('SignInSignUp.jsx - Authenticated, navigating to dashboard');
      navigate(`/${platform}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, navigate, platform]);

  useEffect(() => {
    if (error) {
      console.log('SignInSignUp.jsx - Error:', error);
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (platform !== 'eventpro') {
      console.error('SignInSignUp.jsx - Invalid platform:', platform);
      toast.error('Invalid platform. Please use EventPro login.');
      navigate('/event-form', { replace: true });
      return;
    }
    setFormLoading(true);
    try {
      const response = await dispatch(login({ email, password, platform })).unwrap();
      setFormLoading(false);
      console.log('SignInSignUp.jsx - Login success:', { user: response.user._id, email: response.user.email });
      navigate(response.user.role === 'admin' ? `/${platform}/admin-dashboard` : `/${platform}/dashboard`, { replace: true });
    } catch (err) {
      setFormLoading(false);
      console.error('SignInSignUp.jsx - Login error:', err);
      toast.error(err || 'Invalid email or password');
    }
  };

  const handleGoogleLogin = () => {
    console.log('SignInSignUp.jsx - Initiating Google login for platform:', platform);
    window.location.href = `https://9gt7lodrtl.execute-api.ap-south-1.amazonaws.com/prod/api/auth/google?platform=${platform}`;
  };

  return (
    <Container>
      <LoginForm onSubmit={handleSubmit}>
        <Title aria-label={`${platform} Title`}>{platform === 'eventpro' ? 'EventPro' : 'EventEase'}</Title>
        <Input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={handleChange}
          required
          aria-label="Email"
        />
        <PasswordContainer>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            name="password"
            value={password}
            onChange={handleChange}
            required
            aria-label="Password"
          />
          <ToggleIcon
            icon={showPassword ? faEyeSlash : faEye}
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          />
        </PasswordContainer>
        <Button type="submit" aria-label="Login Button" disabled={formLoading}>
          {formLoading ? <RingLoader color="#000000" loading={formLoading} size={20} /> : 'Login'}
        </Button>
        <GoogleButton onClick={handleGoogleLogin} aria-label="Login with Google">
          <GoogleIcon icon={faGoogle} />
          Login with Google
        </GoogleButton>
      </LoginForm>
      <ToastContainer />
    </Container>
  );
};

SignInSignUp.propTypes = {
  platform: PropTypes.string.isRequired,
};

export default SignInSignUp;
