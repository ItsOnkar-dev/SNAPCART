/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SidebarContext from "./SidebarContext";

const SidebarContextProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
    document.body.style.overflow = "auto";
  }, [location.pathname]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = newState ? "hidden" : "auto";
      return newState;
    });
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    document.body.style.overflow = "auto";
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        openSidebar,
        closeSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContextProvider;
