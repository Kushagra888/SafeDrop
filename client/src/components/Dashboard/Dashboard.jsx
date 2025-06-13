import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./SideBar";
import StatsGrid from "./StatesGrid";
import UserProfile from "./UserProfile";
import UploadPage from "./FileUpload/UploadPage";
import FileShow from "./FileShow";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-blue-700">Loading SafeDrop...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-50">
      <Sidebar 
        sidebarOpen={sidebarOpen}  
        setSidebarOpen={setSidebarOpen} 
        setActiveTab={setActiveTab} 
        activeTab={activeTab}
      />
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      <div className="flex flex-col flex-1">
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          setActiveTab={setActiveTab}
        />
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className={`${activeTab !== 'home' ? 'max-w-6xl mx-auto' : ''}`}>
            {activeTab === "upload" && <UploadPage />}
            {activeTab === "profile" && <UserProfile />}
            
            {activeTab === "home" && 
             <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
                <StatsGrid />
              </div>
              <FileShow />
             </>
            }
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} SafeDrop. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
