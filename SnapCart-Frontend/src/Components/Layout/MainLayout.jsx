/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MainFooter from "../Footer/MainFooter";

const MainLayout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]); // This will run whenever the pathname changes

  // Routes where we don't want to show the main footer
  const excludedRoutes = [
    "/become-seller",
    "/seller/product-management",
    "/admin",
  ];

  const shouldShowMainFooter = !excludedRoutes.includes(location.pathname);

  return (
    <>
      {children}
      {shouldShowMainFooter && <MainFooter />}
    </>
  );
};

export default MainLayout;
