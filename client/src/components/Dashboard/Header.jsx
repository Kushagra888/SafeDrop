import React, { useState } from "react";
import { useSelector } from "react-redux";
import Logout from "./Logout";
import { getValidProfileImageUrl } from "../../utils/profileImageHelper";

const Header = ({ sidebarOpen, setSidebarOpen, setActiveTab }) => {
  const { user } = useSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const handleProfileClick = () => {
    setShowDropdown(false);
    setActiveTab('profile');
  };

  const handleLogoutClick = () => {
    setShowDropdown(false);
    setShowLogoutModal(true);
  };
   
  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
        <div className="flex items-center">
          <button
            className="text-gray-700 focus:outline-none md:hidden mr-4"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Welcome to SafeDrop
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
          
          <div className="relative">
            <div 
              className="flex items-center space-x-3 cursor-pointer p-1 rounded-full hover:bg-gray-100"
              onClick={handleProfileClick}
            >
              <span className="text-gray-700 font-medium hidden md:block">{user?.fullname}</span>
              <img 
                src={getValidProfileImageUrl(user, 36)} 
                alt="Avatar" 
                className="w-9 h-9 rounded-full border-2 border-blue-500" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getValidProfileImageUrl({ fullname: user?.fullname }, 36);
                }}
              />
            </div>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.fullname}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button 
                  onClick={handleProfileClick}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Your Profile
                </button>
                <button 
                  onClick={handleLogoutClick}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <Logout 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
      />
    </>
  );
};

export default Header;
