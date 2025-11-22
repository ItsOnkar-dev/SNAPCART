/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import UserContext from "./UserContext";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const UserContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async () => {
    const token = window.localStorage.getItem("token");
    console.log("[UserContext] Fetching user profile, token exists:", !!token);

    if (!token) {
      console.log("[UserContext] No token found, setting isLoggedIn to false");
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }

    try {
      console.log("[UserContext] Making API call to fetch user profile");
      const response = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Add timeout to prevent hanging requests
        timeout: 10000, // 10 seconds
      });

      setIsLoggedIn(true);
      const userObj =
        response.data?.data?.user ||
        response.data?.data ||
        response.data?.user ||
        response.data;
      console.log("[UserContext] User profile fetched successfully:", userObj);
      setUser(userObj);
    } catch (error) {
      console.error("[UserContext] Error fetching user profile:", error);
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 500)
      ) {
        window.localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
        console.warn(
          "[UserContext] Token invalid or expired. isLoggedIn set to false."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("[UserContext] Initial mount, fetching user profile");
    fetchUserProfile();
  }, []);

  useEffect(() => {
    console.log("[UserContext] User state updated:", {
      isLoggedIn,
      user,
      isLoading,
      userRole: user?.role,
    });
  }, [isLoggedIn, user, isLoading]);

  // Standard login
  const login = async (userCredentials) => {
    try {
      console.log("[UserContext] Attempting login with credentials:", {
        username: userCredentials.username,
      });
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        userCredentials
      );

      console.log("[UserContext] Login response:", response.data);

      if (response.data.status === "error") {
        toast.error(response.data.message || "Login failed. Please try again.");
        return false;
      }

      const token = response.data?.data?.token || response.data?.token;
      if (!token) {
        console.error("[UserContext] No token in response:", response.data);
        toast.error("Invalid response from server. Please try again.");
        return false;
      }

      window.localStorage.setItem("token", token);
      setIsLoggedIn(true);
      const userObj =
        response.data?.data?.user ||
        response.data?.data ||
        response.data?.user ||
        response.data;
      console.log("[UserContext] User logged in:", userObj);
      setUser(userObj);

      // Dispatch custom login event
      window.dispatchEvent(new Event("userLogin"));
      toast.success("Logged in successfully!");

      // Navigate based on user role
      if (userObj.role === "PlatformAdmin") {
        window.location.href = "/";
      } else if (userObj.role === "Seller") {
        window.location.href = "/seller/dashboard";
      } else {
        window.location.href = "/";
      }

      return true;
    } catch (error) {
      console.error(
        "[UserContext] Login error:",
        error.response?.data || error
      );
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
      return false;
    }
  };

  // Handle OAuth success (called from OAuthSuccess component)
  const handleOAuthSuccess = async (token, userData) => {
    try {
      if (token && userData) {
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
        `${API_BASE_URL}/user/update-password`,
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
      const errorMsg =
        error.response?.data?.message ||
        "Failed to update password. Please try again.";
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

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/user/delete-account`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUser(null);
      toast.success(response.data?.message || "Account deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete account. Please try again."
      );
    }
  };

  const downloadUserData = async () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required. Please login.");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/user/download-data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `user_data_${new Date().toISOString().split("T")[0]}.json`
      );
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success("User data downloaded successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to download user data"
      );
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
    handleOAuthSuccess,
  };

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
};

export default UserContextProvider;
