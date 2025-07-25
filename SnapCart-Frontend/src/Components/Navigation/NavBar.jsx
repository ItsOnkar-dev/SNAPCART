/* eslint-disable react/prop-types */
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
import useUserContext from "../../context/User/useUserContext";
import LogOutModal from "../Modals/LogOutModal";
import SearchBar from "../SearchBar";
import Sidebar from "./Sidebar";

const NavBar = ({ isDark, toggleDarkMode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  useEffect(() => {
    console.log("[NavBar] isLoggedIn:", isLoggedIn);
  }, [isLoggedIn]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      document.body.style.overflow = !prev ? "hidden" : "auto";
      return !prev;
    });
  }, []);

  const handleThemeToggle = useCallback(
    (e) => {
      if (e) e.preventDefault();
      toggleDarkMode();
      if (isSidebarOpen) {
        toggleSidebar();
      }
    },
    [toggleDarkMode, isSidebarOpen, toggleSidebar]
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
      navbar: `fixed top-0 w-full p-4 md:px-10 z-30 transition-colors duration-300 border-b border-gray-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg shadow-lg`,
      authNavbar:
        "fixed w-full p-4 md:px-10 xl:px-32 z-30 transition-colors duration-300 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(10,18,49,0.5)] border-b border-gray-200 dark:border-slate-800 backdrop-blur-xl",
      itemsList:
        "flex items-center gap-3 md:gap-1 cursor-pointer text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
      logoName:
        "cursor-pointer text-3xl text-black dark:text-white font-extrabold tracking-wider",
      listStyles: `flex items-center gap-3 transition-all hover:duration-300 ease-in-out hover:skew-x-3 hover:skew-y-1 cursor-pointer tracking-wide`,
      activeStyles:
        "flex items-center gap-3 md:gap-1 brightness-125 font-semibold tracking-wide duration-300",
    }),
    []
  );

  // Safely get the first character of the display name
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

  // Check if avatar URL is valid
  const hasValidAvatar = userAvatar && userAvatar.trim() !== "";

  // Add handlers for logout modal
  const handleLogoutModalClose = () => {
    setShowLogoutConfirmation(false);
    // Make profile modal visible again if needed
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
          <button className="sm:hidden" onClick={toggleSidebar}>
            <MdMenu className="text-2xl" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out hover:skew-x-6 hover:skew-y-3">
            <img
              src={isDark ? SnapCartLogo : SnapCartLogo1}
              alt="Logo"
              className="w-8 h-8 rounded-full"
            />
            <div className={`${styles.logoName}`} onClick={() => navigate("/")}>
              {/* <span>SnapCart</span> */}
              <img
                src={isDark ? SnapCartLogo2 : SnapCartLogo3}
                alt="Logo"
                className="w-40"
              />
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Search Bar */}
            <SearchBar />

            {/* Become a Seller */}
            {isLoggedIn && !seller && (
              <div
                className={"hidden sm:block text-sm lg:text-base"}
                onClick={handleIsLoggedIn}
              >
                <NavLink
                  to="/become-seller"
                  className={({ isActive }) =>
                    isActive
                      ? "text-pink-600"
                      : "text-black/60 dark:text-white/80 hover:text-black dark:hover:text-white flex items-center gap-2"
                  }
                >
                  <div className="flex items-center gap-2 font-semibold tracking-wide">
                    <BadgeIndianRupee />
                    <span>Become a Seller</span>
                  </div>
                </NavLink>
              </div>
            )}
            <NavLink
              to="/wishlist"
              className={({ isActive }) =>
                isActive
                  ? "text-pink-600"
                  : "hidden sm:block text-black/60 dark:text-white/80 hover:text-black dark:hover:text-white"
              }
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  {cartContext.wishlistLength > 0 && (
                    <span className="absolute -top-3 -right-3 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                      {cartContext.wishlistLength}
                    </span>
                  )}
                  <Heart size={20} />
                </div>
              </div>
            </NavLink>
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                isActive
                  ? "text-pink-600"
                  : "text-black/60 dark:text-white/80 hover:text-black dark:hover:text-white flex items-end gap-2"
              }
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  {cartContext.cartLength > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                      {cartContext.cartLength}
                    </span>
                  )}
                  <MdOutlineShoppingBasket className="text-xl md:text-2xl" />
                </div>
                {/* <span className=''>Cart</span> */}
              </div>
            </NavLink>

            <span
              className={`rounded-full transition-transform duration-700 ease-in-ou cursor-pointer p-1.5 bg-gray-200 dark:bg-slate-700 ${
                isDark ? "rotate-90" : "rotate-0"
              }`}
              onClick={handleThemeToggle}
            >
              {isDark ? (
                <Sun size={20} className="text-cyan-300 hover:text-cyan-400" />
              ) : (
                <Moon size={20} className=" text-black/60 hover:text-black " />
              )}
            </span>

            {/* User Profile / Register Button */}
            {isLoggedIn && user ? (
              <div
                ref={profileModalRef}
                onMouseEnter={handleProfileHover}
                onMouseLeave={handleProfileLeave}
              >
                <div
                  ref={profileIconRef}
                  className={`${
                    location.pathname === "/profile"
                      ? "hidden sm:flex gap-2 items-center text-cyan-400 placeholder:font-bold cursor-pointer font-semibold"
                      : "hidden sm:flex items-center gap-2 cursor-pointer font-semibold text-black/60 dark:text-white/80 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {hasValidAvatar ? (
                    <img
                      src={userAvatar}
                      alt="User"
                      className="w-8 h-8 object-cover rounded-full"
                      onError={(e) => {
                        console.error("Avatar image failed to load");
                        e.target.style.display = "none";
                        setUserAvatar(""); // Reset avatar on error
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                      {getInitial()}
                    </div>
                  )}
                  <h3 className="hidden lg:block text-sm lg:text-base tracking-wider">
                    {displayName}
                  </h3>
                  <span
                    className={`transition-transform duration-500 ease-in-out ${
                      isProfileModalOpen
                        ? "rotate-180 opacity-100"
                        : "opacity-80"
                    }`}
                  >
                    <ChevronDown size={18} />
                  </span>
                </div>
                {isProfileModalOpen && (
                  <UserProfile
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    isDark={isDark}
                    handleThemeToggle={handleThemeToggle}
                    showLogoutConfirmation={showLogoutConfirmation}
                    setShowLogoutConfirmation={setShowLogoutConfirmation}
                  />
                )}
              </div>
            ) : (
              <NavLink
                to="/registration"
                state={{ scrollToForm: true }}
                onClick={(e) => {
                  if (location.pathname === "/registration") {
                    e.preventDefault();
                    // If already on registration page, scroll to form on small to medium screens
                    const isSmallToMedium =
                      window.innerWidth >= 640 && window.innerWidth < 768;
                    if (isSmallToMedium) {
                      setTimeout(() => {
                        navigate("/registration", {
                          state: { scrollToForm: true },
                        });
                      }, 100);
                    }
                  }
                }}
                className="hidden sm:flex font-semibold items-center gap-1 text-black/60 dark:text-white/80 hover:text-black dark:hover:text-white"
              >
                <UserRound />
                <span>Login/Register</span>
              </NavLink>
            )}
          </div>
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
      {showLogoutConfirmation && (
        <LogOutModal
          isOpen={showLogoutConfirmation}
          onClose={handleLogoutModalClose}
          onLogoutComplete={handleLogoutComplete}
        />
      )}
    </>
  );
};

export default NavBar;
