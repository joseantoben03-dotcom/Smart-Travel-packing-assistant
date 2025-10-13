import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Luggage, LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Luggage className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Smart Travel Packing Assistant</h1>
              <p className="text-sm text-gray-600">Plan your trips and pack smart with weather-based suggestions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="h-5 w-5" />
              <span className="font-medium">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;