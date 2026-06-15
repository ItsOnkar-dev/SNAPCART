/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useUserContext from "../User/useUserContext";
import SellerContext from "./SellerContext";

const SellerContextProvider = ({ children }) => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const [seller, setSeller] = useState(null);
  const [isSellerLoading, setIsSellerLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [hasCheckedSellerStatus, setHasCheckedSellerStatus] = useState(false);
  const { logout } = useUserContext();

  // Try to fetch current seller if user is logged in
  const fetchSellerData = async () => {
    try {
      setIsSellerLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setSeller(null);
        setIsSellerLoading(false);
        setHasCheckedSellerStatus(true);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/sellers/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      if (response.data.status === "success" && response.data.data) {
        setSeller(response.data.data);
      } else {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchSellerData();
    } else {
      setIsSellerLoading(false);
      setHasCheckedSellerStatus(true);
    }
  }, []);

  // Login as seller is no longer needed since it's unified, but kept for compatibility
  const loginSeller = async (credentials) => {
    // Deprecated
    return null;
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
        setSeller(response.data.data);
        toast.success(
          response.data.message || "Seller account created successfully!",
        );
        setTimeout(() => {
          toast.info(
            "You are now a seller! You can manage your products from your userprofile menu.",
            {
              autoClose: 5000,
            },
          );
        }, 400);
        return response.data.data;
      } else {
        throw new Error(
          response.data?.message || "Failed to create seller account",
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
        `${API_BASE_URL}/sellers/check-email?email=${email}`,
      );
      return response.data.data.exists;
    } catch (error) {
      console.error("Error checking seller email:", error);
      return false;
    }
  };

  // Helper to check if user is logged in as seller
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

      const response = await axios.patch(
        `${API_BASE_URL}/sellers/${sellerId}`,
        sellerData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.data) {
        setSeller(response.data.data);
        toast.success(
          response.data.message || "Seller information updated successfully!",
        );
        return response.data.data;
      } else {
        throw new Error(
          response.data?.message || "Failed to update seller information",
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

  // Logout from seller account actually logs out the user completely now
  const logoutSeller = () => {
    setSeller(null);
    logout(); // calls the UserContext logout
    return true;
  };

  // Refresh seller data
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
        setSeller(null);
        localStorage.removeItem("sellerProducts");
        sessionStorage.removeItem("sellerProducts");

        window.dispatchEvent(new CustomEvent("sellerDeleted"));

        toast.success(
          response.data.message || "Seller account deleted successfully!",
        );
        return true;
      } else {
        throw new Error(
          response.data?.message || "Failed to delete seller account",
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
