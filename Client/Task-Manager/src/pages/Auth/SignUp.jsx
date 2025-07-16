import React, { useContext, useState } from 'react';
import AuthLayout from '../../components/layouts/AuthLAyout';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import UploadImage from '../../utils/uploadImage';

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullname, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminInviteToken, setAdminInviteToken] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    let profileImageUrl = '';

    setError('');
    setLoading(true);
    if (!fullname) {
      setError('Please enter your Full Name.');
      setLoading(false);
      return;
    }
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
    // Simulate signup
    setTimeout(async () => {
      try {
        if (profilePic) {
          const imgUploadRes = await UploadImage(profilePic);
          profileImageUrl = imgUploadRes.imageUrl || "";
        }
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
          name: fullname,
          email,
          password,
          profileImageUrl,
          adminInviteToken
        });

        const { token, role } = response.data;
        if (token) {
          localStorage.setItem('token', token);
          updateUser(response.data);
          if (role === "admin") {
            navigate('/admin/dashboard');
          } else {
            navigate('/user/dashboard');
          }
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
    }, 1200);
  };


  return (
    <AuthLayout>
      <div className="w-full max-w-lg mx-auto p-8 rounded-xl bg-white/20 shadow-xl backdrop-blur-lg animate-fade-in mt-10 md:mt-0">
        <h3 className="text-2xl font-bold text-white mb-2 text-center tracking-wide">Create an Account</h3>
        <p className="text-xs text-slate-200 mb-6 text-center">Join us today by entering your details below.</p>
        {error && <div className="text-red-400 text-xs mb-2 text-center animate-shake">{error}</div>}
        <form onSubmit={handleSignUp} className="flex flex-col gap-6">
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullname}
              onChange={(e) => setFullName(e.target.value)}
              label="Full Name"
              placeholder="Enter your Full Name"
              type="text"
              autoComplete="name"
            />
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
              autoComplete="new-password"
            />
            <Input
              value={adminInviteToken}
              onChange={({ target }) => setAdminInviteToken(target.value)}
              label="Admin Invite Token"
              placeholder="Enter your 6 digit token"
              type="text"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white font-semibold py-2 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-60 w-full mt-6"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-xs text-slate-200 mt-6 text-center">
          Already have an account? <a href="/login" className="text-blue-400 hover:underline">Login</a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;