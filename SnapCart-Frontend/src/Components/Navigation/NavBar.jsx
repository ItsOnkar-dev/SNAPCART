/* eslint-disable react/prop-types */
import { useState, useEffect, useContext, useMemo, useCallback, useRef } from "react";
import Logo from "../../assets/logo.png";
import SearchBar from "../SearchBar";
import { MdOutlineShoppingBasket, MdMenu } from "react-icons/md";
import { ChevronDown, HelpCircle, Globe, Twitter, Instagram, Facebook, Github, LogOut, House, UserRoundPen, Info, LayoutList, Heart, UserRound, Sun, Moon } from "lucide-react";
import IconWithTooltip from "../IconWithTooltip";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import CartContext from "../../context/Cart/CartContext";
import UserContext from "../../context/User/UserContext";
import UserProfile from "../../Components/UserProfile";
import Sidebar from "./Sidebar";

const NavBar = ({ isDark, toggleDarkMode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileIconRef = useRef(null);
  const profileModalRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [displayName, setDisplayName] = useState('User');
  const [userAvatar, setUserAvatar] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const cartContext = useContext(CartContext);
  const { user, logout } = useContext(UserContext);

  // Check if we're on the authentication page
  const isAuthPage = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup";

  // Update displayName whenever user data changes
  useEffect(() => {
    if (user && user.user) {
      const userData = user.user._doc || user.user;
      setDisplayName(userData.name || userData.username || "User");
      // Check all possible locations for avatar image
      const avatarImage = userData.avatar || (userData.googleId && userData.googleId.picture) || userData.picture || userData.profilePicture || '';
      setUserAvatar(avatarImage);
    } else {
      setDisplayName("User");
      setUserAvatar('');
    }
  }, [user]);

  const handleThemeToggle = useCallback((e) => {
    if (e) e.preventDefault(); // Prevent default navigation
    toggleDarkMode();
    if (isSidebarOpen) {
      toggleSidebar();
    }
  }, [toggleDarkMode, isSidebarOpen]);

  const handleLogOut = useCallback(() => {
    logout();
    navigate("/");
    if (isSidebarOpen) {
      toggleSidebar();
    }
  }, [logout, navigate, isSidebarOpen]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      document.body.style.overflow = !prev ? "hidden" : "auto";
      return !prev;
    });
  }, []);

  const navItems = useMemo(() => [
    { id: 1, icon: <House size={20} />, title: "Home", path: "/home" },
    { id: 2, icon: <LayoutList size={20} />, title: "Products", path: "/products" },
    { id: 3, icon: <Info size={20} />, title: "About", path: "/about" },
    { id: 4, icon: <UserRoundPen size={20} />, title: "Contact", path: "/contact" },
    { id: 5, icon: <Heart size={20} />, title: "Favorites", path: "/favorites" },
    { id: 6, icon: <UserRound size={20} />, title: "Profile", path: "/profile" },
    { 
      id: 7, 
      icon: isDark ? <Sun size={20} className="text-cyan-300" /> : <Moon size={20} />, 
      title: isDark ? "Light Mode" : "Dark Mode",  
      onClick: handleThemeToggle,
      className: "md:hidden"
    },
    { id: 8, icon: <LogOut size={20} />, title: "Log Out", onClick: handleLogOut, className: "md:hidden" },
  ], [isDark, handleThemeToggle, handleLogOut]);

  const handleProfileHover = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsProfileModalOpen(true);
  };

  const handleProfileLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsProfileModalOpen(false);
    }, 200);
  };

  // Clear any pending timeouts when component unmounts
  useEffect(() => {
    return () => {
      clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const styles = useMemo(
    () => ({
      navbar: `fixed w-full p-4 md:px-10 z-30 transition-colors duration-300 bg-[rgb(255,255,255)] dark:bg-[rgb(10,18,49)] border-b border-gray-200 dark:border-slate-800 ${isSidebarOpen ? "backdrop-blur-xl inset-0" : "backdrop-blur-xl"
        }`,
      authNavbar:
        "fixed w-full p-4 md:px-10 xl:px-32 z-30 transition-colors duration-300 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(10,18,49,0.5)] border-b border-gray-200 dark:border-slate-800 backdrop-blur-xl",
      itemsList: "flex items-center gap-3 md:gap-1 cursor-pointer text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
      logoName: "cursor-pointer font-extrabold text-2xl tracking-wide uppercase",
      listStyles: `flex items-center gap-3 transition-all hover:duration-300 ease-in-out hover:skew-x-3 hover:skew-y-1 cursor-pointer tracking-wide`,
      activeStyles: "flex items-center gap-3 md:gap-1 brightness-125 font-semibold tracking-wide duration-300",
    }),
    [isSidebarOpen]
  );

  // Render auth navbar
  if (isAuthPage) {
    return (
      <nav className={`${styles.authNavbar}`}>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <div className='flex items-center gap-2'>
            <img src={Logo} alt='Logo' className='w-6' />
            <div className={styles.logoName} onClick={() => navigate("/")}>
              <span className='text-gradient1 dark:text-gradient'>Snap</span>
              <span className='text-gray-800 dark:text-white'>Cart</span>
            </div>
          </div>

          {/* Auth Nav Icons */}
          <div className='flex items-center gap-3 sm:gap-6'>
            <IconWithTooltip tooltip='Help Center'>
              <div className={styles.iconButton}>
                <HelpCircle className='w-5 h-5 text-gray-600 dark:text-gray-300' />
              </div>
            </IconWithTooltip>

            <IconWithTooltip tooltip='Language'>
              <div className={styles.iconButton}>
                <Globe className='w-5 h-5 text-gray-600 dark:text-gray-300' />
              </div>
            </IconWithTooltip>

            <div className='sm:flex items-center gap-3 sm:gap-6 border-l border-gray-200 dark:border-gray-700 pl-3 ml-1 hidden'>
              <IconWithTooltip tooltip='Twitter'>
                <div className={styles.iconButton}>
                  <Twitter className='w-5 h-5 text-gray-600 dark:text-gray-300' />
                </div>
              </IconWithTooltip>

              <IconWithTooltip tooltip='Instagram'>
                <div className={styles.iconButton}>
                  <Instagram className='w-5 h-5 text-gray-600 dark:text-gray-300' />
                </div>
              </IconWithTooltip>

              <IconWithTooltip tooltip='Facebook'>
                <div className={styles.iconButton}>
                  <Facebook className='w-5 h-5 text-gray-600 dark:text-gray-300' />
                </div>
              </IconWithTooltip>

              <IconWithTooltip tooltip='Github'>
                <div className={styles.iconButton}>
                  <Github className='w-5 h-5 text-gray-600 dark:text-gray-300' />
                </div>
              </IconWithTooltip>
            </div>

            <IconWithTooltip tooltip={isDark ? "Light Mode" : "Dark Mode"}>
              <div className={styles.iconButton} onClick={handleThemeToggle}>
                {isDark ? <Sun size={20} className='w-5 h-5 text-yellow-400' /> : <Moon size={20} className=' text-gray-600' />}
              </div>
            </IconWithTooltip>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Main Navbar */}
      <nav className={styles.navbar}>
        <div className='flex items-center justify-between'>
          {/* Mobile Menu Button */}
          <button className='lg:hidden' onClick={toggleSidebar}>
            <MdMenu className='text-2xl' />
          </button>

          {/* Logo */}
          <div className='flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out hover:skew-x-6 hover:skew-y-3'>
            <img src={Logo} alt='Logo' className='w-6' />
            <div className={`${styles.logoName}`} onClick={() => navigate("/home")}>
              <span className='text-gradient1 dark:text-gradient'>Snap</span>
              <span className='text-gray-600 hover:text-black dark:text-white'>Cart</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden lg:block'>
            <ul className='flex items-center gap-8'>
              {navItems.slice(0, 6).map((item) => (
                <li key={item.id} className={`${styles.listStyles} ${(item.id === 4 || item.id === 5) ? "block md:hidden" : ""}`}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `${isActive ? styles.activeStyles : styles.itemsList}`}>
                    {item.icon}
                    {item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Search and Icons */}
          <div className='flex items-center md:gap-6 '>
            {/* Search Bar */}
            <SearchBar />

            {/* Action Icons */}
            <div className='flex items-center gap-4 md:gap-6 text-xl lg:text-2xl'>
              <IconWithTooltip tooltip='Favorites'>
                <NavLink to='/wishlist' className={({ isActive }) => (isActive ? "text-pink-600 font-bold" : "hidden md:block text-black/60 dark:text-white/80")}>
                <Heart size={20} />
                </NavLink>
              </IconWithTooltip>
              <IconWithTooltip tooltip='Cart'>
                <NavLink to='/cart' className={({ isActive }) => (isActive ? "text-pink-600 font-bold" : "text-black/60 dark:text-white/80")}>
                  <div className='relative'>
                    <span className='absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full px-1.5 py-0.5'>{cartContext.cartLength}</span>
                    <MdOutlineShoppingBasket />
                  </div>
                </NavLink>
              </IconWithTooltip>

              <div onClick={handleThemeToggle} className='hidden sm:block cursor-pointer transition-transform duration-500 ease-in-out bg-gray-200 dark:bg-slate-700 rounded-full p-1.5'>
                <span className={`rounded-full bg-gray-300 transition-transform duration-700 ease-in-out ${isDark ? "rotate-90" : "rotate-0"}`}>
                  {isDark ? <Sun size={20} className='text-cyan-300 hover:text-cyan-400' /> : <Moon size={20} className=' text-black/60 hover:text-black ' />}
                </span>
              </div>

              <div ref={profileModalRef} onMouseEnter={handleProfileHover} onMouseLeave={handleProfileLeave}>
                <div
                  ref={profileIconRef}
                  className={`${location.pathname === "/profile"
                    ? "hidden md:flex gap-2 items-center text-cyan-500 dark:text-cyan-300 font-bold cursor-pointer"
                    : "hidden md:flex items-center gap-2 cursor-pointer text-black/80 dark:text-white/80"
                    }`}>
                  {userAvatar ? (
                    <img src={userAvatar} alt="User" className="w-8 object-cover rounded-full"/>
                  ) : (
                    <div className="w-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 className='text-sm'>{displayName}</h3>
                  <span className={`transition-transform duration-500 ease-in-out ${isProfileModalOpen ? "rotate-180 opacity-100" : "opacity-80"}`}>
                    <ChevronDown size={18} />
                  </span>
                </div>

                {isProfileModalOpen && <UserProfile isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Component */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        navItems={navItems}
        isDark={isDark}
      />
    </>
  );
};

export default NavBar;