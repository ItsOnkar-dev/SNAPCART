/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PrivateRoute = ({ isAuthenticated }) => {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("Please login/register to continue");

      // Delay redirection slightly to allow toast to render
      const timer = setTimeout(() => {
        setRedirect(true);
      }, 500); // You can tweak this time

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  if (redirect) return <Navigate to="/registration" replace />;
  return isAuthenticated ? <Outlet /> : null;
};

export default PrivateRoute;
