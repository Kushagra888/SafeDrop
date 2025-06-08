import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../redux/slice/auth/authThunk';
import { resetAuthError } from '../redux/slice/auth/authSlice';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    fullname: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Registration successful!');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.fullname || !formData.username || !formData.password) {
      toast.error('Please fill in all fields');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(registerUser(formData)).unwrap();
    } catch (err) {
      const errorMessage = err?.error || err?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      dispatch(resetAuthError());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex justify-center items-center px-4">
      <div className="max-w-5xl w-full flex overflow-hidden rounded-2xl shadow-xl">
        {/* Left side - Image */}
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12 text-white">
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-6">Join SafeDrop Today</h2>
            <p className="text-blue-100 mb-8">
              Create an account to start sharing files securely. 
              Your data is protected with industry-leading encryption.
            </p>
          </div>
        </div>
        
        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 bg-white p-8 md:p-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              SafeDrop
            </h1>
            <p className="text-gray-500 mt-2">Secure File Sharing Made Simple</p>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Your Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                type="text"
                name="fullname"
                onChange={handleChange}
                value={formData.fullname}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                type="text"
                name="username"
                onChange={handleChange}
                value={formData.username}
                placeholder="Choose a username"
                required
                minLength={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                type="email"
                name="email"
                onChange={handleChange}
                value={formData.email}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                type="password"
                name="password"
                onChange={handleChange}
                value={formData.password}
                placeholder="Create a password (min. 6 characters)"
                required
                minLength={6}
              />
            </div>
            
            <button
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md transition-all duration-300 flex items-center justify-center"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : "Sign Up"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-800">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
