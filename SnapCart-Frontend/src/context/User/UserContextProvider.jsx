/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import UserContext from "./UserContext";
import { toast } from "react-toastify";

const UserContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const fetchUserProfile = async () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
       console.error("No token found in local storage, please login to get started");
      setIsLoggedIn(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("User Profile:", response.data);
      setIsLoggedIn(true);
      setUser(response.data);
    } catch (error) {
      setIsLoggedIn(false);
      console.log("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const login = async (userCredentials) => {
    try {
      const response = await axios.post("http://localhost:8000/auth/login", userCredentials);
      console.log("Profile Fetched", response.data)
      window.localStorage.setItem("token", response.data?.token);
      toast.success(response.data?.msg);
      setIsLoggedIn(true);
      setUser(response.data)
    } catch (error) {
      console.error(error);
      toast.error(error.response.data?.errMsg);
    }
  };

  const logout = async () => {
    try {
      window.localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error Logging out");
    }
  };

  const context = {
    isLoggedIn: isLoggedIn,
    login: login,
    logout: logout,
    user: user,
  };

  return <UserContext.Provider value={context}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
