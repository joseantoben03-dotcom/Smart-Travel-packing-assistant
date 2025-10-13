import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Luggage } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Luggage className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Smart Travel Packing Assistant</h2>
            <p className="mt-2 text-gray-600">Plan your trips and pack smart with weather-based suggestions</p>
          </div>

          <div className="flex mb-6">
            <Link
              to="/login"
              className="flex-1 py-2 px-4 text-center bg-blue-600 text-white rounded-l-lg font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="flex-1 py-2 px-4 text-center bg-gray-200 text-gray-700 rounded-r-lg font-medium hover:bg-gray-300 transition-colors duration-200"
            >
              Register
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={!formData.email || !formData.password}
            >
              Login
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;