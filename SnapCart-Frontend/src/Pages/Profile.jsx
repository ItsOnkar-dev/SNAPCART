import { useContext } from "react";
import UserContext from "../context/User/UserContext";
import { NavLink, useNavigate } from "react-router-dom";

const Profile = () => {
  const { isLoggedIn, logout, user } = useContext(UserContext);

  const navigate = useNavigate()

  const handleLogOut = () => {
    logout();
    navigate("/");
  };

  return (
    <div className='flex items-center justify-between px-4 py-40'>
      <div className='text-slate-800 dark:text-white text-sm'>
        {isLoggedIn && (
          <NavLink to='/profile'>
            <h3>Username: {user.user._doc.username}</h3>
          </NavLink>
        )}
      </div>
      <div>
        {isLoggedIn && (
          <button onClick={handleLogOut} className='bg-red-500 text-white font-semibold text-sm rounded-md px-6 py-1.5'>
            Log Out
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
