/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import SnapCartLogo2 from "../../assets/SnapCartLog01.png";
import SnapCartLogo3 from "../../assets/SnapCartLogo2.png";
import useSellerContext from "../../context/Seller/useSellerContext";
import useUserContext from "../../context/User/useUserContext";
import DeleteSellerModal from "../Modals/Seller/DeleteSellerModal";

const SellerNavBar = ({
  isDark,
  toggleDarkMode,
  openLoginModal,
  openRegisterModal,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { isLoggedIn } = useUserContext();
  const { seller, logoutSeller, isLoggedInAsSeller, refreshSellerData } =
    useSellerContext();

  useEffect(() => {
    if (isLoggedIn && isLoggedInAsSeller) {
      refreshSellerData();
    }
  }, [isLoggedIn, isLoggedInAsSeller]);

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
    logoutSeller();
    navigate("/become-seller");
  };

  return (
    <>
      <nav className="fixed top-0 w-full p-4 md:px-10 z-30 transition-colors duration-300 bg-[rgb(255,255,255)] dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <img
              src={isDark ? SnapCartLogo2 : SnapCartLogo3}
              alt="SnapCart Logo"
              className="h-8 w-auto"
            />
          </NavLink>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800  transition-transform duration-700 ease-in-out cursor-pointer "
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-cyan-300 hover:text-cyan-400" />
              ) : (
                <Moon className="w-5 h-5 text-black/60 hover:text-black" />
              )}
            </button>

            {/* Conditional rendering based on seller login status */}
            {isLoggedIn && isLoggedInAsSeller && seller ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-black/60 dark:text-white/80 hover:text-black dark:hover:text-white">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient text-white text-lg font-bold">
                    {seller?.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span>{seller?.username}</span>
                </div>

                <div className="hidden sm:flex items-center gap-4">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-1.5 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-600 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-md transition-colors"
                  >
                    Logout
                  </button>

                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-4">
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
                  className="px-4 py-1.5 bg-gradient text-white rounded-md transition-colors duration-300"
                >
                  Start Selling Today
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Delete Account Modal */}
      <DeleteSellerModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

export default SellerNavBar;
