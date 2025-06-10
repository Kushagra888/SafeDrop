import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/slice/auth/authThunk";
import { useState } from "react";

const Logout = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await dispatch(logoutUser());
            window.location.href = "/login";
        } catch (error) {
            console.error('Logout error:', error);
            setIsLoggingOut(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-white p-6 rounded-lg shadow-xl w-96 max-w-[90%] transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                {!isLoggingOut ? (
                    <>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Logout</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to logout from SafeDrop?</p>
                        <div className="flex justify-end space-x-4">
                            <button 
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-12 h-12 border-t-4 border-red-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
                        <h1 className="text-xl font-bold text-gray-700">Logging out...</h1>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Logout;