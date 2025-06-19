/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SellerContext from "./SellerContext";

const SellerContextProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [isSellerLoading, setIsSellerLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [hasCheckedSellerStatus, setHasCheckedSellerStatus] = useState(false);
  const [isSellerLoggedOut, setIsSellerLoggedOut] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem("isSellerLoggedOut") === "true";
  });

  const API_BASE_URL = "http://localhost:8000";

  // Try to fetch current seller if user is logged in
  const fetchSellerData = async () => {
    try {
      setIsSellerLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, clearing seller state");
        setSeller(null);
        setIsSellerLoading(false);
        setHasCheckedSellerStatus(true);
        return;
      }

      // If seller was explicitly logged out, don't fetch data
      if (isSellerLoggedOut) {
        console.log("Seller was logged out, not fetching data");
        setSeller(null);
        setIsSellerLoading(false);
        setHasCheckedSellerStatus(true);
        return;
      }

      console.log("Fetching seller data with token");
      const response = await axios.get(`${API_BASE_URL}/sellers/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success" && response.data.data) {
        console.log("Seller data fetched successfully:", response.data.data);
        setSeller(response.data.data);
      } else {
        console.log("No seller data found in response");
        setSeller(null);
      }
    } catch (error) {
      console.error("Error fetching seller data:", error);
      setSeller(null);
      if (error.response && error.response.status !== 404) {
        setErrors({ fetch: "Failed to fetch seller information" });
      }
    } finally {
      setIsSellerLoading(false);
      setHasCheckedSellerStatus(true);
    }
  };

  // Load seller data on initial mount
  useEffect(() => {
    fetchSellerData();
  }, []);

  // Login as seller
  const loginSeller = async (credentials) => {
    setErrors(null);
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        const errorMsg = "You must be logged in to access seller features";
        toast.error(errorMsg);
        setErrors({ login: errorMsg });
        throw new Error(errorMsg);
      }

      // Include the token in the request header
      const response = await axios.post(
        `${API_BASE_URL}/sellers/login`,
        credentials,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        // Update seller state immediately
        setSeller(response.data.data);
        setIsSellerLoggedOut(false);
        localStorage.removeItem("isSellerLoggedOut"); // Clear the logout flag
        toast.success(response.data.message || "Logged in successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data?.message || "Failed to login");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to login";
      toast.error(errorMsg);
      setErrors({ login: errorMsg });
      throw error;
    }
  };

  // Create new seller
  const createSeller = async (sellerData) => {
    setErrors(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to become a seller");
      }

      const response = await axios.post(`${API_BASE_URL}/sellers`, sellerData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        // Update seller state immediately
        setSeller(response.data.data);
        toast.success(
          response.data.message || "Seller account created successfully!"
        );
        setTimeout(() => {
          toast.info(
            "You are now a seller! You can manage your products from your userprofile menu.",
            {
              autoClose: 5000,
            }
          );
        }, 400);
        return response.data.data;
      } else {
        throw new Error(
          response.data?.message || "Failed to create seller account"
        );
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to create seller account";
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
      throw error;
    }
  };

  // Check if email has a seller account
  const checkSellerEmail = async (email) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/sellers/check-email?email=${email}`
      );
      return response.data.data.exists;
    } catch (error) {
      console.error("Error checking seller email:", error);
      return false;
    }
  };

  // Helper to check if user is logged in as seller
  const isLoggedInAsSeller = Boolean(seller) && !isSellerLoggedOut;

  // Update seller information
  const updateSeller = async (sellerId, sellerData) => {
    try {
      if (!sellerId) {
        throw new Error("Seller ID is required to update seller information");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to update seller information");
      }

      const response = await axios.patch(
        `${API_BASE_URL}/sellers/${sellerId}`,
        sellerData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setSeller(response.data.data);
        toast.success(
          response.data.message || "Seller information updated successfully!"
        );
        return response.data.data;
      } else {
        throw new Error(
          response.data?.message || "Failed to update seller information"
        );
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update seller information";
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
      throw error;
    }
  };

  // Logout from seller account (but maintain user login)
  const logoutSeller = () => {
    setSeller(null);
    setIsSellerLoggedOut(true);
    localStorage.setItem("isSellerLoggedOut", "true"); // Persist the logout state
    toast.success("Successfully logged out from seller account!");
    return true;
  };

  // Refresh seller data (can be called after login or other operations)
  const refreshSellerData = () => {
    return fetchSellerData();
  };

  // Delete seller account
  const deleteSeller = async () => {
    setErrors(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to delete your seller account");
      }

      const response = await axios.delete(`${API_BASE_URL}/sellers/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.status === "success") {
        // Clear seller state
        setSeller(null);
        // Clear any cached product data
        localStorage.removeItem("sellerProducts");
        sessionStorage.removeItem("sellerProducts");

        // Force a refresh of the public products list
        window.dispatchEvent(new CustomEvent("sellerDeleted"));

        toast.success(
          response.data.message || "Seller account deleted successfully!"
        );
        return true;
      } else {
        throw new Error(
          response.data?.message || "Failed to delete seller account"
        );
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete seller account";
      toast.error(errorMsg);
      setErrors({ delete: errorMsg });
      throw error;
    }
  };

  return (
    <SellerContext.Provider
      value={{
        seller,
        isSellerLoading,
        errors,
        loginSeller,
        isSellerLoggedOut,
        createSeller,
        checkSellerEmail,
        hasCheckedSellerStatus,
        isLoggedInAsSeller,
        updateSeller,
        logoutSeller,
        refreshSellerData,
        deleteSeller,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
};

export default SellerContextProvider;
