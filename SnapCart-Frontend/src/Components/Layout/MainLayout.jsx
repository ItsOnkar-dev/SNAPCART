/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MainFooter from "../Footer/MainFooter";
import SellerFooter from "../Footer/SellerFooter";

const MainLayout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]); // This will run whenever the pathname changes

  // Routes where we don't want to show any footer
  const excludedRoutes = ["/admin"];

  // Routes where we want to show the seller footer
  const sellerRoutes = ["/become-seller", "/seller/dashboard"];

  const shouldShowMainFooter =
    !excludedRoutes.includes(location.pathname) &&
    !sellerRoutes.includes(location.pathname);
  const shouldShowSellerFooter = sellerRoutes.includes(location.pathname);

  return (
    <>
      {children}
      {shouldShowMainFooter && <MainFooter />}
      {shouldShowSellerFooter && <SellerFooter />}
    </>
  );
};

export default MainLayout;
