import React, { useState } from "react";
import { useSelector } from "react-redux";
import Logout from "./Logout";

const Sidebar = ({ sidebarOpen, setSidebarOpen, setActiveTab, activeTab }) => {
  const { user } = useSelector((state) => state.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const handleTabClick = (tab) => {
    if (tab === "logout") {
      setShowLogoutModal(true);
    } else {
      setActiveTab(tab);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  };

  const tabs = [
    { name: "Dashboard", icon: "🏠", id: "home" },
    { name: "Upload Files", icon: "📤", id: "upload" },
    { name: "Profile", icon: "👤", id: "profile" },
  ];

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 ease-in-out z-40 w-72 bg-white shadow-lg md:translate-x-0 md:static md:inset-0 border-r border-gray-200`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h1 className="text-2xl font-bold">SafeDrop</h1>
            <p className="text-sm text-blue-100 mt-1">Secure File Sharing</p>
          </div>
          
          {/* User Profile Section */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <img 
              src={user?.profilePic} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-blue-500"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-800">{user?.fullname}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 ${
                  activeTab === tab.id 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3 text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}

            {/* Logout Button */}
            <button
              onClick={() => handleTabClick("logout")}
              className="flex items-center p-3 rounded-lg w-full transition-all duration-200 text-red-600 hover:bg-red-50"
            >
              <span className="mr-3 text-xl">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </nav>
          
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium">Need Help?</p>
              <p className="text-xs mt-1">Check our documentation or contact support for assistance.</p>
            </div>
          </div>
        </div>
      </div>

      <Logout 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
      />
    </>
  );
};

export default Sidebar;
