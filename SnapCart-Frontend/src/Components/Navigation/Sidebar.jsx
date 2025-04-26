/* eslint-disable react/prop-types */
import { MdClose } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import SidebarFooter from "./SidebarFooter";

const Sidebar = ({ isSidebarOpen, toggleSidebar, navItems }) => {
  const navigate = useNavigate();

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
      <div className={`fixed top-0 left-0 h-full w-72 bg-white px-6 py-4 z-50 transform transition-transform duration-500 ease-in-out xl:hidden dark:bg-[rgb(15,23,42)] flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src={Logo} alt="Logo" className="w-6" />
            <div
              className="cursor-pointer font-extrabold text-2xl tracking-wide uppercase"
              onClick={() => {
                navigate("/home");
                toggleSidebar();
              }}>
              <span className="text-gradient1 dark:text-gradient">Snap</span>
              <span className="text-gray-600 hover:text-black dark:text-white">Cart</span>
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
                  className={({ isActive }) => `flex items-center gap-3 md:gap-1 ${isActive ? "brightness-125 font-semibold tracking-wide" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
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
    </>
  );
};

export default Sidebar;