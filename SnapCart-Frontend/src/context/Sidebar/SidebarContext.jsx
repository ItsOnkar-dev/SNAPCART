import { createContext } from "react";

const SidebarContext = createContext({
  isSidebarOpen: false,
  toggleSidebar: () => {},
  openSidebar: () => {},
  closeSidebar: () => {},
});

export default SidebarContext;
