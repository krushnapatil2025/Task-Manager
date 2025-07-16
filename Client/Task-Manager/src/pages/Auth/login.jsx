import React, { useState } from 'react';
import AuthLayout from '../../components/layouts/AuthLAyout';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Password cannot be empty.');
      setLoading(false);
      return;
    }
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, role } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        updateUser(response.data)
        if (role === "admin") {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      } else {
        setError('Invalid email or password.');
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Something Went Wrong. Please try again later');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login-container w-full max-w-md mx-auto p-8 rounded-xl bg-white/20 shadow-xl backdrop-blur-lg animate-fade-in">
        <h3 className="text-2xl font-bold text-white mb-2 text-center tracking-wide">Welcome Back</h3>
        <p className="text-xs text-slate-200 mb-6 text-center">Please enter your details to log in</p>
        {error && <div className="text-red-400 text-xs mb-2 text-center animate-shake">{error}</div>}
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="Enter your email"
            type="text"
            autoComplete="email"
          />
          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Enter your password"
            type="password"
            autoComplete="current-password"
          />
          <button type="submit" className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white font-semibold py-2 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-60" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-xs text-slate-200 mt-6 text-center">
          Don't have an account? <a href="/SignUP" className="text-blue-400 hover:underline">SignUP</a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;