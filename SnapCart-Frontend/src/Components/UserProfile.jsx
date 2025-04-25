/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import UserContext from "../context/User/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Package, Heart, CreditCard, Settings, LogOut, X } from "lucide-react";

const UserProfile = ({ isOpen, onClose }) => {
  const { isLoggedIn, logout, user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const tabs = [
    { id: "profile", label: "My Profile", icon: User, path: "/profile" },
    { id: "orders", label: "Orders", icon: Package, path: "/orders" },
    { id: "wishlist", label: "Wishlist", icon: Heart, path: "/wishlist" },
    { id: "payment", label: "Payment", icon: CreditCard, path: "/payment" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  const [activeTab, setActiveTab] = useState(location.pathname);

   // Update active tab when location changes
   useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);
 
  // Control visibility for smooth transitions
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure CSS transition works properly
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Check if user data is loaded
  useEffect(() => {
    if (user) {
      setIsLoading(false);
    } else if (!isLoggedIn) {
      setIsLoading(false);
    }
  }, [user, isLoggedIn]);

  const handleLogin = () => {
    handleClose()
    setTimeout(() => {
      navigate("/login");
    }, 300);
  }

  const handleLogOut = () => {
    setIsVisible(false);
    setTimeout(() => {
      logout();
      onClose();
      navigate("/");
    }, 300); // Match transition duration
  };

  const handleTabClick = (path) => {
    setActiveTab(path);
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      navigate(path);
    }, 300); // Match transition duration
  };

  // Handle closing with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match transition duration
  };

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity duration-300`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">Loading your profile...</h2>
        </div>
      </div>
    );
  }

  // Animation classes based on visibility state
  const modalClasses = `
    fixed z-50 right-0
    transition-all duration-500 ease-in-out
    ${isVisible ? 'opacity-100 transform translate-y-6' : 'opacity-0 transform -translate-y-6 pointer-events-none'}
  `;

  // If user is not logged in, show login prompt
  if (!isLoggedIn || !user) {
    return (
      <div className={modalClasses}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-10 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-center">Please login to view your profile</h2>
          <div className="flex justify-center">
            <button
              onClick={handleLogin}
              className="bg-cyan-600 text-white text-sm font-semibold rounded-md px-10 py-2 hover:bg-cyan-700 transition-colors duration-200"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  const userData = user && user.user && user.user._doc ? user.user._doc : {};

  return (
    <div className={modalClasses}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-md w-full p-10 transform transition-transform duration-300 ease-in-out">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Profile</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden mr-4">
            {userData.avatar ? (
              <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-cyan-500 text-white text-2xl font-bold">
                {userData.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              {userData.name || userData.username || "User"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{userData.email || "No email provided"}</p>
          </div>
        </div>

        <div className="border-b-2 border-gray-200 dark:border-gray-700 "></div>

        {/* Navigation Tabs */}
        <div className="space-y-2 py-4">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md transition-all duration-300 transform hover:translate-x-1 ${
                activeTab === tab.path ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="border-t-2 border-gray-200 dark:border-gray-700 "></div>

        {/* Logout Button */}
        <div className="pt-6">
          <button
            onClick={handleLogOut}
            className="w-full flex items-center gap-3 text-sm px-4 py-3 text-white bg-red-500 hover:bg-red-700 rounded-md transition-all duration-300 transform hover:translate-y-1"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;