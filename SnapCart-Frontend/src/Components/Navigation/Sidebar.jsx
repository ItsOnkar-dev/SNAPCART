/* eslint-disable react/prop-types */
import {
  Heart,
  House,
  Info,
  LayoutDashboard,
  LogOut,
  Moon,
  Store,
  Sun,
  UserRound,
  UserRoundPen,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { MdClose } from "react-icons/md";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import SnapCartLogo from "../../assets/SnapCart.png";
import SnapCartLogo1 from "../../assets/SnapCart1.png";
import SnapCartLogo2 from "../../assets/SnapCartLog01.png";
import SnapCartLogo3 from "../../assets/SnapCartLogo2.png";
import useSellerContext from "../../context/Seller/useSellerContext";
import useUserContext from "../../context/User/useUserContext";
import LogOutModal from "../Modals/LogOutModal";
import SidebarFooter from "./SidebarFooter";

const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  isDark,
  handleThemeToggle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useUserContext();
  const { isLoggedInAsSeller, seller, isSellerLoggedOut } = useSellerContext();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogin = useCallback(() => {
    // Always close sidebar first
    if (isSidebarOpen) {
      toggleSidebar();
    }

    if (location.pathname === "/registration") {
      const isSmallToMedium = window.innerWidth < 768;
      if (isSmallToMedium) {
        setTimeout(() => {
          navigate("/registration", { state: { scrollToForm: true } });
        }, 300);
      }
    } else {
      navigate("/registration", { state: { scrollToForm: true } });
    }
  }, [isSidebarOpen, toggleSidebar, navigate, location.pathname]);

  const handleLogOut = useCallback(() => {
    setShowLogoutConfirmation(true);
  }, []);

  const handleLogoutModalClose = useCallback(() => {
    setShowLogoutConfirmation(false);
  }, []);

  const handleLogoutComplete = useCallback(() => {
    navigate("/");
    if (isSidebarOpen) {
      toggleSidebar();
    }
  }, [navigate, isSidebarOpen, toggleSidebar]);

  const navItems = useMemo(() => {
    let items = [
      { id: 1, icon: <House size={20} />, title: "Home", path: "/" },
      { id: 2, icon: <Info size={20} />, title: "About", path: "/about" },
      {
        id: 3,
        icon: <UserRoundPen size={20} />,
        title: "Contact",
        path: "/contact",
      },
      {
        id: 4,
        icon: <Heart size={20} />,
        title: "Favorites",
        path: "/favorites",
      },
    ];

    // Add role-specific tab (only one)
    if (user?.role === "PlatformAdmin") {
      items = [
        ...items.slice(0, 1),
        {
          id: 6,
          icon: <LayoutDashboard size={20} />,
          title: "Admin Dashboard",
          path: "/admin/dashboard",
        },
        ...items.slice(1),
      ];
    } else if (isLoggedInAsSeller && seller) {
      items = [
        ...items.slice(0, 1),
        {
          id: 6,
          icon: <Store size={20} />,
          title: "Manage Products",
          path: "/seller/dashboard",
        },
        ...items.slice(1),
      ];
    } else if (isSellerLoggedOut) {
      items = [
        ...items.slice(0, 1),
        {
          id: 6,
          icon: <Store size={20} />,
          title: "Login as Seller",
          path: "/become-seller",
        },
        ...items.slice(1),
      ];
    }

    if (isLoggedIn) {
      items.push({
        id: 5,
        icon: <UserRound size={20} />,
        title: "Profile",
        path: "/profile",
      });
    }

    items.push({
      id: 7,
      icon: isDark ? (
        <Sun size={20} className="text-cyan-300" />
      ) : (
        <Moon size={20} />
      ),
      title: isDark ? "Light Mode" : "Dark Mode",
      onClick: handleThemeToggle,
      className: "md:hidden",
    });
    items.push({
      id: 8,
      icon: <LogOut size={20} />,
      title: isLoggedIn ? "Log Out" : "Login/Register",
      onClick: isLoggedIn ? handleLogOut : handleLogin,
      className: "md:hidden",
      path: isLoggedIn ? null : "/registration",
    });

    return items;
  }, [
    isDark,
    handleThemeToggle,
    handleLogOut,
    isLoggedIn,
    handleLogin,
    isLoggedInAsSeller,
    isSellerLoggedOut,
    seller,
    user,
  ]);

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white px-6 py-4 z-50 transform transition-transform duration-500 ease-in-out xl:hidden dark:bg-[rgb(15,23,42)] flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            {isDark ? (
              <img
                src={SnapCartLogo}
                alt="Logo"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <img
                src={SnapCartLogo1}
                alt="Logo"
                className="w-8 h-8 rounded-full"
              />
            )}
            <div
              className="cursor-pointer font-extrabold text-2xl tracking-wider"
              onClick={() => {
                navigate("/home");
                toggleSidebar();
              }}
            >
              {/* <span>SnapCart</span> */}
              {isDark ? (
                <img src={SnapCartLogo2} alt="Logo" className="w-32 sm:w-40" />
              ) : (
                <img src={SnapCartLogo3} alt="Logo" className="w-32 sm:w-40" />
              )}
            </div>
          </div>
          <button onClick={toggleSidebar}>
            <MdClose className="text-2xl hover:scale-105" />
          </button>
        </div>

        {/* Navigation Items */}
        <ul className="space-y-7 py-10 flex-grow">
          {navItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 transition-all hover:duration-300 ease-in-out hover:skew-x-3 hover:skew-y-1 cursor-pointer tracking-wide"
            >
              {item.onClick ? (
                <div
                  className="flex items-center gap-3 md:gap-1 cursor-pointer text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  onClick={item.onClick}
                >
                  {item.icon}
                  {item.title}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={toggleSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 md:gap-1 ${
                      isActive
                        ? "brightness-125 font-semibold tracking-wide"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`
                  }
                >
                  {item.icon}
                  {item.title}
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        {/* Footer */}
        <SidebarFooter />
      </div>

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

export default Sidebar;
