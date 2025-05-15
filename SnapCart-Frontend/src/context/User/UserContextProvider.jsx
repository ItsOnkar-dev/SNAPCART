/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import UserContext from "./UserContext";
import { toast } from "react-toastify";

const UserContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsLoggedIn(true);
      const userObj = response.data?.data?.user || response.data?.data || response.data?.user || response.data;
      setUser(userObj);
      console.log("[UserContext] User profile fetched:", userObj);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 500)) {
        window.localStorage.removeItem("token");
        setIsLoggedIn(false);
        console.warn("[UserContext] Token invalid or expired. isLoggedIn set to false.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    console.log("[UserContext] isLoggedIn:", isLoggedIn);
  }, [isLoggedIn]);

  // Standard login
  const login = async (userCredentials) => {
    try {
      const response = await axios.post("http://localhost:8000/auth/registration", userCredentials);
      window.localStorage.setItem("token", response.data?.data?.token || response.data?.token);
      toast.success(response.data?.message || "Login successful");
      setIsLoggedIn(true);
      const userObj = response.data?.data?.user || response.data?.data || response.data?.user || response.data;
      setUser(userObj);
      console.log("[UserContext] User logged in:", userObj);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
      return false;
    }
  };

  // Handle OAuth success (called from OAuthSuccess component)
  const handleOAuthSuccess = async (token, userData) => {
    try {
      if(token && userData) {
        window.localStorage.setItem("token", token);
        setIsLoggedIn(true);
        setUser(userData);
        console.log("[UserContext] OAuth login success. User:", userData);
        toast.success("Google Authentication Successful");
        return true;
      }
    } catch (error) {
      toast.error("Failed to process authentication. Please try again.");
      return false;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required. Please login.");
    }

    try {
      const response = await axios.put(
        "http://localhost:8000/user/update-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data?.message || "Password updated successfully");
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update password. Please try again.";
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    try {
      window.localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  const deletedAccount = async () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required. Please login.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete your account? This action is irreversible!")) {
      return;
    }

    try {
      const response = await axios.delete("http://localhost:8000/user/delete-account", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      window.localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUser(null);
      toast.success(response.data?.message || "Account deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account. Please try again.");
    }
  };

  const downloadUserData = async () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required. Please login.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/user/download-data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `user_data_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success("User data downloaded successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download user data");
    }
  };

  const context = {
    isLoggedIn,
    user,
    isLoading,
    login,
    logout,
    updatePassword,
    deletedAccount,
    downloadUserData,
    handleOAuthSuccess
  };

  return <UserContext.Provider value={context}>{children}</UserContext.Provider>;
};

export default UserContextProvider;