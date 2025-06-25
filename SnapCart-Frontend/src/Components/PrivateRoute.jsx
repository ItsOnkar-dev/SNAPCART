/* eslint-disable react/prop-types */
import { Outlet, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import useUserContext from "../context/User/useUserContext";
import "react-toastify/dist/ReactToastify.css";

const PrivateRoute = () => {
  const { isLoggedIn, isLoading } = useUserContext();

  if (isLoading) {
    // Optionally, show a loading spinner here
    return null;
  }

  if (!isLoggedIn) {
    toast.info("Please login/register to continue");
    return <Navigate to="/registration" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
