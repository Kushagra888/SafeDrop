import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../../redux/slice/auth/authThunk";

const StatsGrid = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Make sure we're using the correct user ID property
        const userId = user?.id || user?._id;
        if (userId) {
          console.log('Fetching updated user data for ID:', userId);
          await dispatch(getUser(userId)).unwrap();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Refresh user data every 30 seconds
    const intervalId = setInterval(fetchUserData, 30000);
    
    return () => clearInterval(intervalId);
  }, [dispatch, user?.id, user?._id]);

  // Format last login date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return "N/A";
    }
  };

  const cards = [
    {
      title: "Total Uploads",
      value: user?.totalUploads ?? 0,
      icon: "📤"
    },
    {
      title: "Total Downloads",
      value: user?.totalDownloads ?? 0,
      icon: "📥"
    },
    {
      title: "Videos Uploaded",
      value: user?.videoCount ?? 0,
      icon: "🎬"
    },
    {
      title: "Images Uploaded",
      value: user?.imageCount ?? 0,
      icon: "🖼️"
    },
    {
      title: "Documents Uploaded",
      value: user?.documentCount ?? 0,
      icon: "📄"
    },
    {
      title: "Last Login",
      value: formatDate(user?.lastLogin),
      icon: "🕒"
    },
  ];

  return (
    <div className="mt-6">
      {/* Profile Header */}
      <div className="flex items-center mb-6 gap-4">
        <img
          src={user?.profilePic}
          alt="Profile"
          className="w-16 h-16 rounded-full border"
        />
        <div>
          <h2 className="text-xl font-semibold">{user?.fullname}</h2>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-400">@{user?.username}</p>
        </div>
        {loading && (
          <div className="ml-auto">
            <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-gray-500">{card.title}</h4>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsGrid;
