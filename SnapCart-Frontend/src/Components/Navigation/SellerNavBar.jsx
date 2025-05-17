/* eslint-disable react/prop-types */
import { useCallback } from 'react';
import SnapCartLogo from '../../assets/SnapCart.png';
import SnapCartLogo1 from '../../assets/SnapCart1.png';
import SnapCartLogo2 from '../../assets/SnapCartLog01.png';
import SnapCartLogo3 from '../../assets/SnapCartLogo2.png';
import { Sun, Moon, BadgeIndianRupee } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useUserContext from '../../context/User/useUserContext';

const SellerNavBar = ({ isDark, toggleDarkMode, openLoginModal, openRegisterModal }) => {
  const { isLoggedIn } = useUserContext();

  const navigate = useNavigate()

  const handleThemeToggle = useCallback(
    (e) => {
      if (e) e.preventDefault();
      toggleDarkMode();
    },
    [toggleDarkMode]
  );

  return (
    <nav className="fixed top-0 w-full p-4 md:px-10 z-30 transition-colors duration-300 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
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
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Seller Central</h1>
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

          {isLoggedIn ? (
            <NavLink to="/seller/dashboard" className={({ isActive }) =>
              isActive ? "text-pink-600" : "text-black/60 dark:text-white/80 hover:text-black dark:hover:text-white flex items-center gap-2"
            }>
              <div className="flex items-center gap-2">
                <BadgeIndianRupee />
                <span>Seller Dashboard</span>
              </div>
            </NavLink>
          ) : (
            <>
              {/* Login button */}
              <button
                onClick={openLoginModal}
                className="px-4 py-2 text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white border border-transparent hover:border-gray-300 dark:hover:border-gray-700 rounded-md transition-colors"
              >
                Login
              </button>

              {/* Start Selling button */}
              <button
                onClick={openRegisterModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-300"
              >
                Start Selling
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SellerNavBar;