/* eslint-disable react/prop-types */
import { useCallback, useContext, useMemo, useState } from "react";
import Logo from "../assets/Logo.png";
import SearchBar from "./SearchBar";
import { MdFavoriteBorder, MdOutlineShoppingBasket, MdMenu, MdClose, MdNightlight, MdLightMode } from "react-icons/md";
import { HelpCircle, Globe, Twitter, Instagram, Facebook, Github } from "lucide-react";
import { AiOutlineUser } from "react-icons/ai";
import IconWithTooltip from "./IconWithTooltip";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import CartContext from "../context/Cart/CartContext";
import UserContext from "../context/User/UserContext";

const NavBar = ({ isDark, toggleDarkMode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const cartContext = useContext(CartContext);
  const { isLoggedIn, logout } = useContext(UserContext);

  // Check if we're on the authentication page
  const isAuthPage = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup";

  const navItems = [
    { id: 1, title: "Home" },
    { id: 2, title: "Products" },
    { id: 3, title: "About" },
    { id: 4, title: "Contact" },
  ];

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      document.body.style.overflow = !prev ? "hidden" : "auto";
      return !prev;
    });
  }, []);

  const handleLogOut = () => {
    logout()
    navigate('/')
  }


  const styles = useMemo(
    () => ({
      navbar: `fixed w-full p-4 sm:px-10 z-30 transition-colors duration-300 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(10,18,49,0.5)] border-b border-gray-200 dark:border-slate-800 ${
        isSidebarOpen ? "backdrop-blur-xl inset-0" : "backdrop-blur-xl"
      }`,
      sidebar: `fixed top-0 left-0 h-full w-72 bg-white px-6 py-4 z-50 transform transition-transform duration-700 ease-in-out xl:hidden dark:bg-[rgb(15,23,42)] ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`,
      logoName: "cursor-pointer font-extrabold text-2xl tracking-wide uppercase",
      listStyles: `transition-all hover:duration-300 ease-in-out hover:skew-x-6 hover:skew-y-3 cursor-pointer tracking-wide`,
      activeStyles: "text-gradient1 dark:text-gradient dark:brightness-125 font-semibold tracking-wide underline underline-offset-8",
    }),
    [isSidebarOpen]
  );

  // Render auth navbar
  if (isAuthPage) {
    return (
      <nav className={`${styles.navbar}`}>
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
              <div className={styles.iconButton} onClick={toggleDarkMode}>
                {isDark ? <MdLightMode className='w-5 h-5 text-yellow-400' /> : <MdNightlight className='w-5 h-5 text-gray-600' />}
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
          <button className='xl:hidden' onClick={toggleSidebar}>
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
          <div className='hidden xl:block'>
            <ul className='flex items-center gap-10'>
              {navItems.map((item) => (
                <li key={item.id} className={styles.listStyles}>
                  <NavLink to={item.title === "Home" ? "/home" : `/${item.title.toLowerCase()}`} className={({ isActive }) => `${isActive ? styles.activeStyles : "text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white"}`}>
                    {item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Search and Icons */}
          <div className='flex items-center gap-4 lg:gap-10'>
            {/* Search Bar - Desktop */}
            <SearchBar/>

            {/* Action Icons */}
            <div className='flex items-center gap-4 xl:gap-6 text-xl lg:text-2xl'>
              <IconWithTooltip tooltip='Favorites' className='hidden sm:block'>
                <MdFavoriteBorder onClick={() => navigate("/wishlist")} className={location.pathname === "/wishlist" ? "text-pink-600 font-bold" : ""} />
              </IconWithTooltip>
              <IconWithTooltip tooltip='Cart'>
                <NavLink to='/cart' className={({ isActive }) => (isActive ? "text-pink-600 font-bold" : "")}>
                  <div className='relative'>
                    <span className='absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full px-1.5 py-0.5'>{cartContext.cartLength}</span>
                    <MdOutlineShoppingBasket />
                  </div>
                </NavLink>
              </IconWithTooltip>
              <IconWithTooltip tooltip='Profile'>
                <AiOutlineUser onClick={() => navigate("/profile")} className={location.pathname === "/profile" ? "text-cyan-300 font-bold" : ""} />
              </IconWithTooltip>
              <div onClick={toggleDarkMode} className='cursor-pointer text-slate-500 dark:text-slate-300 hover:dark:text-white hover:text-black'>
              {isDark ? (
                <>
                  <MdLightMode className='text-xl text-yellow-300' />
                </>
              ) : (
                <>
                  <MdNightlight className='text-xl' />
                </>
              )}
              </div>
              {
                isLoggedIn &&
                <button onClick={handleLogOut}
                  className='bg-red-500 text-white font-semibold text-sm rounded-md px-6 py-1.5 hidden sm:block'>Log Out
                </button>
              }
            </div>
          </div>
        </div>

        {isSidebarOpen && <div className='fixed inset-0 bg-black bg-opacity-80 dark:bg-opacity-40 z-40 transition-opacity xl:hidden' onClick={toggleSidebar} />}
      </nav>

      {/* Mobile Sidebar */}
      <div className={styles.sidebar}>
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-2 cursor-pointer'>
            <img src={Logo} alt='Logo' className='w-6' />
            <div
              className={`${styles.logoName}`}
              onClick={() => {
                navigate("/home");
                toggleSidebar();
              }}>
              <span className='text-gradient1 dark:text-gradient'>Snap</span>
              <span className='text-gray-600 hover:text-black dark:text-white'>Cart</span>
            </div>
          </div>
          <button onClick={toggleSidebar}>
            <MdClose className='text-3xl' />
          </button>
        </div>
        <ul className='space-y-6'>
          {navItems.map((item) => (
            <li key={item.id} className={styles.listStyles} onClick={toggleSidebar}>
              <NavLink to={item.title === "Home" ? "/home" : `/${item.title.toLowerCase()}`} className={({ isActive }) => `${isActive ? styles.activeStyles : "text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white"}`}>
                {item.title}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className='my-8 py-6 border-t border-gray-200 dark:border-slate-700'>
          <div className='space-y-7'>
            <div
              className='flex items-center gap-3 cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              onClick={() => {
                navigate("/wishlist");
                toggleSidebar();
              }}>
              <MdFavoriteBorder className='text-xl' />
              <span>Favorites</span>
            </div>
            <div
              className='flex items-center gap-3 cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              onClick={() => {
                navigate("/profile");
                toggleSidebar();
              }}>
              <AiOutlineUser className='text-xl' />
              <span>Profile</span>
            </div>
            <div 
              className='flex items-center gap-3 cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white' 
              onClick={toggleDarkMode}>
              {isDark ? (
                <>
                  <MdLightMode className='text-xl text-yellow-400' />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <MdNightlight className='text-xl' />
                  <span>Dark Mode</span>
                </>
              )}
            </div>
            {
              isLoggedIn &&
              <button 
                className='bg-red-500 text-white font-semibold text-sm rounded-md px-8 py-1.5 sm:hidden'>Log Out
              </button>
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
