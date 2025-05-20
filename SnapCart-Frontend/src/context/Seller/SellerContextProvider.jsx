/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import SellerContext from "./SellerContext";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SellerContextProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [isSellerLoading, setIsSellerLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [hasCheckedSellerStatus, setHasCheckedSellerStatus] = useState(false);

  const API_BASE_URL = "http://localhost:8000";

  // Fetch seller profile
  const fetchSellerProfile = async () => {
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

      console.log("Fetching seller data with token");
      const response = await axios.get(`${API_BASE_URL}/sellers/current`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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

  // Try to fetch current seller if user is logged in
  useEffect(() => {
    fetchSellerProfile();
  }, []);

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
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.data) {
        setSeller(response.data.data);
        toast.success(response.data.message || "Seller account created successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data?.message || "Failed to create seller account");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to create seller account";
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
      throw error;
    }
  };

  // Check if email has a seller account
  const checkSellerEmail = async (email) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sellers/check-email?email=${email}`);
      return response.data.data.exists;
    } catch (error) {
      console.error("Error checking seller email:", error);
      return false;
    }
  };

  const isLoggedInAsSeller = Boolean(seller);

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

      const response = await axios.patch(`${API_BASE_URL}/sellers/${sellerId}`, sellerData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.data) {
        setSeller(response.data.data);
        toast.success(response.data.message || "Seller information updated successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data?.message || "Failed to update seller information");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to update seller information";
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
      throw error;
    }
  };

  // Logout from seller account (but maintain user login)
  const logoutSeller = () => {
    setSeller(null);
    setHasCheckedSellerStatus(false);
    toast.success("Successfully logged out from seller account!");
    return true;
  };

  // Debug logging
  useEffect(() => {
    console.log("SellerContext state update:", {
      seller,
      isLoggedInAsSeller,
      hasCheckedSellerStatus
    });
  }, [seller, isLoggedInAsSeller, hasCheckedSellerStatus]);

  return (
    <SellerContext.Provider value={{
      seller,
      isSellerLoading,
      errors,
      createSeller,
      checkSellerEmail,
      hasCheckedSellerStatus,
      isLoggedInAsSeller,
      updateSeller,
      logoutSeller,
      fetchSellerProfile,
    }}>
      {children}
    </SellerContext.Provider>
  );
};

export default SellerContextProvider;