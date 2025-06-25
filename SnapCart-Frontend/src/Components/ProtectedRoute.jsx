/* eslint-disable react/prop-types */
import { Navigate } from 'react-router-dom';
import useUserContext from '../context/User/useUserContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoggedIn, isLoading } = useUserContext();

  if (isLoading) {
    // Optionally, show a loading spinner here
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/registration" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 