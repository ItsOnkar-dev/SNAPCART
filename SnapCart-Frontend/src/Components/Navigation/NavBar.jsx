/* eslint-disable react/prop-types */
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeIndianRupee,
  ChevronDown,
  Heart,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdMenu, MdOutlineShoppingBasket } from "react-icons/md";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SnapCartLogo from "../../assets/SnapCart.png";
import SnapCartLogo1 from "../../assets/SnapCart1.png";
import SnapCartLogo2 from "../../assets/SnapCartLog01.png";
import SnapCartLogo3 from "../../assets/SnapCartLogo2.png";
import UserProfile from "../../Components/UserProfile";
import useCartContext from "../../context/Cart/useCartContext";
import useSellerContext from "../../context/Seller/useSellerContext";
import useSidebarContext from "../../context/Sidebar/useSidebarContext";
import useUserContext from "../../context/User/useUserContext";
import LogOutModal from "../Modals/LogOutModal";
import SearchBar from "../SearchBar";
import Sidebar from "./Sidebar";

const NavBar = ({ isDark, toggleDarkMode }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const profileIconRef = useRef(null);
  const profileModalRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [displayName, setDisplayName] = useState("User");
  const [userAvatar, setUserAvatar] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const cartContext = useCartContext();
  const { user, isLoggedIn } = useUserContext();
  const { seller } = useSellerContext();
  const { isSidebarOpen, toggleSidebar } = useSidebarContext();

  // Update displayName whenever user data changes
  useEffect(() => {
    if (isLoggedIn && user) {
      const name = user.name || user.username || "User";
      setDisplayName(name);
      const avatarImage = user.avatar || "";
      setUserAvatar(avatarImage);
      console.log("[NavBar] User detected:", user);
    } else {
      setDisplayName("User");
      setUserAvatar("");
      console.log("[NavBar] No user logged in.");
    }
  }, [user, isLoggedIn]);

  const handleThemeToggle = useCallback(
    (e) => {
      if (e) e.preventDefault();
      toggleDarkMode();
      if (isSidebarOpen) {
        toggleSidebar();
      }
    },
    [toggleDarkMode, isSidebarOpen, toggleSidebar],
  );

  const handleProfileHover = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsProfileModalOpen(true);
  };

  const handleProfileLeave = () => {
    if (!showLogoutConfirmation) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsProfileModalOpen(false);
      }, 200);
    }
  };

  const handleIsLoggedIn = () => {
    if (isLoggedIn && seller) {
      navigate("/seller/dashboard");
      toast.success("You are already logged in as a seller!");
    }
  };

  // Clear any pending timeouts when component unmounts
  useEffect(() => {
    return () => {
      clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const styles = useMemo(
    () => ({
      navbar: `fixed top-0 w-full p-4 md:px-10 z-30 transition-colors duration-300 border-b border-white/20 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm`,
      logoName:
        "cursor-pointer text-3xl text-black dark:text-white font-extrabold tracking-wider",
    }),
    [],
  );

  const getInitial = () => {
    if (
      displayName &&
      typeof displayName === "string" &&
      displayName.length > 0
    ) {
      return displayName.charAt(0).toUpperCase();
    }
    return "?";
  };

  const hasValidAvatar = userAvatar && userAvatar.trim() !== "";

  const handleLogoutModalClose = () => {
    setShowLogoutConfirmation(false);
    if (isProfileModalOpen === false) {
      setTimeout(() => setIsProfileModalOpen(true), 10);
    }
  };
  const handleLogoutComplete = () => {
    setShowLogoutConfirmation(false);
    setIsProfileModalOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className={styles.navbar}>
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="sm:hidden" 
            onClick={toggleSidebar}
          >
            <MdMenu className="text-2xl text-slate-800 dark:text-slate-200" />
          </motion.button>

          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={isDark ? SnapCartLogo : SnapCartLogo1}
              alt="Logo"
              className="w-8 h-8 rounded-full shadow-sm"
            />
            <div className={`${styles.logoName}`}>
              <img
                src={isDark ? SnapCartLogo2 : SnapCartLogo3}
                alt="Logo"
                className="w-40"
              />
            </div>
          </motion.div>

          {/* Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Search Bar */}
            <div className="hidden md:block">
               <SearchBar />
            </div>

            {/* Become a Seller */}
            {isLoggedIn && !seller && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={"hidden sm:block text-sm lg:text-base"}
                onClick={handleIsLoggedIn}
              >
                <NavLink
                  to="/become-seller"
                  className={({ isActive }) =>
                    isActive
                      ? "text-pink-600"
                      : "text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors"
                  }
                >
                  <div className="flex items-center gap-2 font-semibold tracking-wide">
                    <BadgeIndianRupee size={20} />
                    <span>Become a Seller</span>
                  </div>
                </NavLink>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
              <NavLink
                to="/wishlist"
                className={({ isActive }) =>
                  isActive
                    ? "text-pink-600"
                    : "hidden sm:block text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
                }
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <AnimatePresence>
                      {cartContext.wishlistLength > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-500 to-rose-500 shadow-md text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          {cartContext.wishlistLength}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <Heart size={22} />
                  </div>
                </div>
              </NavLink>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }}>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  isActive
                    ? "text-pink-600"
                    : "text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white flex items-end gap-2 transition-colors"
                }
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <AnimatePresence>
                      {cartContext.cartLength > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-md text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          {cartContext.cartLength}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <MdOutlineShoppingBasket className="text-2xl" />
                  </div>
                </div>
              </NavLink>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: isDark ? 90 : -90 }}
              whileTap={{ scale: 0.9 }}
              className={`rounded-full p-2 bg-slate-100/80 dark:bg-slate-800/80 shadow-inner backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 transition-colors`}
              onClick={handleThemeToggle}
            >
              {isDark ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-slate-600" />
              )}
            </motion.button>

            {/* User Profile / Register Button */}
            {isLoggedIn && user ? (
              <div
                ref={profileModalRef}
                onMouseEnter={handleProfileHover}
                onMouseLeave={handleProfileLeave}
                className="relative"
              >
                <motion.div
                  ref={profileIconRef}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${
                    location.pathname === "/profile"
                      ? "hidden sm:flex gap-2 items-center text-cyan-500 cursor-pointer font-semibold"
                      : "hidden sm:flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors"
                  }`}
                >
                  {hasValidAvatar ? (
                    <img
                      src={userAvatar}
                      alt="User"
                      className="w-9 h-9 object-cover rounded-full border-2 border-transparent hover:border-cyan-400 transition-colors"
                      onError={(e) => {
                        console.error("Avatar image failed to load");
                        e.target.style.display = "none";
                        setUserAvatar("");
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 shadow-sm rounded-full flex items-center justify-center text-white font-bold border border-white/20">
                      {getInitial()}
                    </div>
                  )}
                  <h3 className="hidden lg:block text-sm lg:text-base tracking-wider">
                    {displayName}
                  </h3>
                  <motion.span
                    animate={{ rotate: isProfileModalOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={18} />
                  </motion.span>
                </motion.div>
                
                <AnimatePresence>
                  {isProfileModalOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 z-50 origin-top-right"
                    >
                      <UserProfile
                        isOpen={isProfileModalOpen}
                        onClose={() => setIsProfileModalOpen(false)}
                        isDark={isDark}
                        handleThemeToggle={handleThemeToggle}
                        showLogoutConfirmation={showLogoutConfirmation}
                        setShowLogoutConfirmation={setShowLogoutConfirmation}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <NavLink
                  to="/registration"
                  state={{ scrollToForm: true }}
                  onClick={(e) => {
                    if (location.pathname === "/registration") {
                      e.preventDefault();
                      const isSmallToMedium = window.innerWidth >= 640 && window.innerWidth < 768;
                      if (isSmallToMedium) {
                        setTimeout(() => {
                          navigate("/registration", {
                            state: { scrollToForm: true },
                          });
                        }, 100);
                      }
                    }
                  }}
                  className="hidden sm:flex font-semibold items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <UserRound size={18} />
                  <span>Login</span>
                </NavLink>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Mobile Search - Rendered Below Navbar on Small Screens */}
        <div className="md:hidden mt-3">
          <SearchBar />
        </div>
      </nav>

      {/* Sidebar Component */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        handleThemeToggle={handleThemeToggle}
        isDark={isDark}
      />

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutConfirmation && (
          <LogOutModal
            isOpen={showLogoutConfirmation}
            onClose={handleLogoutModalClose}
            onLogoutComplete={handleLogoutComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
