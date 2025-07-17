import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deleteUser, updateUser } from "../../redux/slice/auth/authThunk";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getValidProfileImageUrl } from "../../utils/profileImageHelper";

const UserProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        fullname: user.fullname || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    if (!formData.username.trim() || !formData.fullname.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (formData.username === user?.username && formData.fullname === user?.fullname) {
      toast.info("No changes to update");
      setEditModalOpen(false);
      return;
    }
    
    try {
      setIsSubmitting(true);
      if (!user?.id) {
        throw new Error("User ID not found");
      }
      
      const result = await dispatch(updateUser({ 
        userId: user.id, 
        userData: {
          username: formData.username,
          fullname: formData.fullname
        }
      })).unwrap();
      
      // Update local form data with the fresh user data
      setFormData({
        username: result.username || "",
        fullname: result.fullname || "",
      });
      
      toast.success("Profile updated successfully!");
      setEditModalOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      if (!user?.id) {
        throw new Error("User ID not found");
      }
      
      await dispatch(deleteUser(user.id)).unwrap();
      toast.success("Account deleted successfully");
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      toast.error(error?.message || "Failed to delete account");
      setDeleteModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-white shadow-lg rounded-xl mx-auto mt-10">
        <div className="text-center text-gray-600">Loading user profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl mx-auto mt-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">User Profile</h2>

      <div className="flex items-center gap-6">
        <img 
          src={getValidProfileImageUrl(user, 112)} 
          alt="Profile" 
          className="w-28 h-28 rounded-full border-2 border-blue-500 object-cover" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getValidProfileImageUrl({ fullname: user?.fullname }, 112);
          }}
        />
        <div className="flex-1 space-y-1">
          <h3 className="text-xl font-semibold text-gray-900">{user.fullname || "No name set"}</h3>
          <p className="text-gray-600">@{user.username || "username"}</p>
          <p className="text-gray-700">{user.email || "No email set"}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-4">
        <button
          onClick={() => setEditModalOpen(true)}
          className="w-full md:w-1/2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded shadow"
        >
          Edit Profile
        </button>
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="w-full md:w-1/2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded shadow"
        >
          Delete Account
        </button>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Edit Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
            <h3 className="text-xl font-semibold text-red-600">Delete Account</h3>
            <p className="text-gray-600">
              Are you sure you want to delete your account? This action cannot be undone.
              All your data will be permanently removed.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
