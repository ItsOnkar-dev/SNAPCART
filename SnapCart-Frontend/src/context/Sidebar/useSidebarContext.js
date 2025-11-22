import { useContext } from "react";
import SidebarContext from "./SidebarContext";

const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error(
      "useSidebarContext must be used within a SidebarContextProvider"
    );
  }
  return context;
};

export default useSidebarContext;

