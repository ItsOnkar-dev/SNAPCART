/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import SnapCartLogo from '../../assets/SnapCart.png';
import SnapCartLogo1 from '../../assets/SnapCart1.png';
import SnapCartLogo2 from '../../assets/SnapCartLog01.png';
import SnapCartLogo3 from '../../assets/SnapCartLogo2.png';
import { Sun, Moon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useUserContext from '../../context/User/useUserContext';
import useSellerContext from '../../context/Seller/useSellerContext';

const SellerNavBar = ({ isDark, toggleDarkMode, openLoginModal, openRegisterModal }) => {
  const { isLoggedIn } = useUserContext();
  const {
    seller,
    logoutSeller,
    isLoggedInAsSeller
  } = useSellerContext();

  const navigate = useNavigate();
  const location = useLocation();


  const handleThemeToggle = useCallback(
    (e) => {
      if (e) e.preventDefault();
      toggleDarkMode();
    },
    [toggleDarkMode]
  );

  const handleLogout = () => {
    // First clear local storage token
    // localStorage.removeItem("token");
    logoutSeller();
    navigate('/become-seller');
  }

  // Debug
  console.log("Seller NavBar Render State:", {
    isLoggedIn,
    seller,
    sellerName: seller?.username
  });

  return (
    <nav className="fixed top-0 w-full p-4 md:px-10 z-30 transition-colors duration-300 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className='flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out hover:skew-x-6 hover:skew-y-3'>
          <img src={isDark ? SnapCartLogo : SnapCartLogo1} alt='Logo' className='w-8 h-8 rounded-full' />
          <div onClick={() => navigate("/")}>
            {/* <span>SnapCart</span> */}
            <img src={isDark ? SnapCartLogo2 : SnapCartLogo3} alt='Logo' className='w-32 sm:w-40' />
          </div>
        </div>

        {/* Middle section - title */}
        <div className="hidden md:flex items-center">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {location.pathname === '/become-seller' ? 'Become a Seller' : 'Seller Central'}
          </h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <span
            className={`rounded-full transition-transform duration-700 ease-in-out cursor-pointer ${isDark ? "rotate-90" : "rotate-0"}`}
            onClick={handleThemeToggle}
          >
            {isDark ? (
              <Sun size={22} className="text-cyan-300 hover:text-cyan-400" />
            ) : (
              <Moon size={22} className="text-black/60 hover:text-black" />
            )}
          </span>

          {/* Conditional rendering based on seller login status */}
          {isLoggedIn && isLoggedInAsSeller && seller ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-black/60 dark:text-white/80 hover:text-black dark:hover:text-white">
                <div className='w-8 h-8 rounded-full flex items-center justify-center bg-gradient text-white text-lg font-bold'>
                  {seller?.username?.charAt(0).toUpperCase() || "?"}
                </div>
                <span className="hidden sm:inline">{seller?.username}</span>
              </div>

              <button
                onClick={handleLogout}
                className="px-8 py-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div>
              {/* Login button */}
              <button
                onClick={openLoginModal}
                className="px-4 py-1.5 text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white border border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600 rounded-md transition-colors"
              >
                Login as Seller
              </button>

              {/* Start Selling button */}
              <button
                onClick={openRegisterModal}
                className="px-4 py-2 bg-gradient text-white rounded-md transition-colors duration-300"
              >
                Start Selling Today
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SellerNavBar;