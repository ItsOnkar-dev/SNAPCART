/* eslint-disable react/prop-types */
import {
  CreditCard,
  Heart,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Settings,
  Store,
  Sun,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSellerContext from "../context/Seller/useSellerContext";
import useUserContext from "../context/User/useUserContext";

const UserProfile = ({
  isOpen,
  onClose,
  isDark,
  handleThemeToggle,
  showLogoutConfirmation,
  setShowLogoutConfirmation,
}) => {
  const { isLoggedIn, user } = useUserContext();
  const { isLoggedInAsSeller, seller, isSellerLoggedOut } = useSellerContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  const profileTabs = [
    { id: 1, label: "My Profile", icon: <User />, path: "/profile" },
    { id: 2, label: "Orders", icon: <Package />, path: "/orders" },
    { id: 3, label: "Wishlist", icon: <Heart />, path: "/wishlist" },
    { id: 4, label: "Payment", icon: <CreditCard />, path: "/payment" },
    { id: 5, label: "Settings", icon: <Settings />, path: "/settings" },
  ];

  let tabs = profileTabs;

  if (user?.role === "PlatformAdmin") {
    tabs = [
      ...profileTabs.slice(0, 1),
      {
        id: 8,
        label: "Admin Dashboard",
        icon: <LayoutDashboard />,
        path: "/admin/dashboard",
      },
      ...profileTabs.slice(1),
    ];
  } else if (isLoggedIn && isLoggedInAsSeller) {
    tabs = [
      ...profileTabs.slice(0, 1),
      {
        id: 8,
        label: "Manage Products",
        icon: <Store />,
        path: "/seller/dashboard",
      },
      ...profileTabs.slice(1),
    ];
  } else if (isLoggedIn && seller && isSellerLoggedOut) {
    tabs = [
      ...profileTabs.slice(0, 1),
      {
        id: 8,
        label: "Login as Seller",
        icon: <Store />,
        path: "/become-seller",
      },
      ...profileTabs.slice(1),
    ];
  }

  tabs.push({
    id: 6,
    label: isDark ? "Light Mode" : "Dark Mode",
    icon: isDark ? <Sun /> : <Moon />,
    onClick: handleThemeToggle,
    path: null,
  });
  tabs.push({
    id: 7,
    label: "Log Out",
    icon: <LogOut />,
    onClick: () => setShowLogoutConfirmation(true),
    path: null,
  });

  const [activeTab, setActiveTab] = useState(location.pathname);

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen && !showLogoutConfirmation) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, showLogoutConfirmation]);

  const handleLogin = () => {
    handleClose();
    setTimeout(() => {
      navigate("/login");
    }, 300);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab.path);

    if (tab.onClick) {
      tab.onClick();
      return;
    }
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      navigate(tab.path);
    }, 300);
  };

  // Handle closing with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const modalClasses = `
    fixed z-50 right-0 
    transition-all duration-500 ease-in-out
    ${
      isVisible && !showLogoutConfirmation
        ? "opacity-100 transform translate-y-4"
        : "opacity-0 transform -translate-y-6 pointer-events-none"
    }
  `;

  // If user is not logged in, show login prompt
  if (!isLoggedIn || !user) {
    return (
      <div className={modalClasses}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-10 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-center">
            Please login to view your profile
          </h2>
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

  // Use the user object directly, as in the updated NavBar
  const userData = user || {};

  return (
    <>
      {/* Main Profile Modal */}
      <div className={modalClasses}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-md h-auto w-full px-6 py-8 transform transition-transform duration-300 ease-in-out">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Your Profile
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log("Avatar failed to load:", userData.avatar);
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-cyan-500 text-white text-2xl font-bold">${
                      userData.name?.charAt(0).toUpperCase() ||
                      userData.username?.charAt(0).toUpperCase() ||
                      "?"
                    }</div>`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-cyan-500 text-white text-2xl font-bold">
                  {userData.name?.charAt(0).toUpperCase() ||
                    userData.username?.charAt(0).toUpperCase() ||
                    "?"}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wider">
                {userData.name || userData.username || "User"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {userData.email || "No email provided"}
              </p>
              <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mt-1">
                {userData.role === "PlatformAdmin"
                  ? "Admin"
                  : userData.role === "Seller" && isLoggedInAsSeller
                  ? "Seller"
                  : "Customer"} 
              </p>
            </div>
          </div>

          <div className="border-b-2 border-gray-200 dark:border-gray-700"></div>

          {/* Navigation Tabs */}
          <div className="space-y-1 pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md transition-all duration-500 transform hover:translate-x-1 tracking-wider ${
                  tab.path && activeTab === tab.path
                    ? "bg-gray-100 dark:bg-gray-700 font-semibold"
                    : ""
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
