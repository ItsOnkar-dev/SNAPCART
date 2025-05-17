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

  // Try to fetch current seller if user is logged in
  useEffect(() => {
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

        const cachedSeller = localStorage.getItem("sellerData");
        if (cachedSeller) {
          try {
            setSeller(JSON.parse(cachedSeller));
          } catch (err) {
            console.log(err)
            localStorage.removeItem("sellerData");
          }
        }

        const response = await axios.get(`${API_BASE_URL}/sellers/current`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("Fetched Current Seller Successfully", response.data);

        if (response.data.status === "success" && response.data.data) {
          // Save seller data in state and localStorage
          setSeller(response.data.data);
          localStorage.setItem("sellerData", JSON.stringify(response.data.data));
          localStorage.setItem("sellerId", response.data.data._id);
        }
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          setSeller(null);
          localStorage.removeItem("sellerData");
          localStorage.removeItem("sellerId");
          console.error("Authentication error fetching seller data:", error);
        } else if (error.response && error.response.status !== 404) {
          console.error("Error fetching seller data:", error);
          setErrors({ fetch: "Failed to fetch seller information" });
        }
      } finally {
        setIsSellerLoading(false);
        setHasCheckedSellerStatus(true);
      }
    };

    fetchSellerData();
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
        console.log("[SellerContext] Seller created:", response.data.data);
        toast.success(response.data.message || "Seller account created successfully!");
        return response.data.data;
      } else if (response.data) {
        setSeller(response.data);
        console.log("[SellerContext] Seller created:", response.data);
        toast.success(response.data.message || "Seller account created successfully!");
        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to create seller account");
      }
    } catch (error) {
      let errorMsg = error.response?.data?.message || error.message || "Failed to create seller account";
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
      throw error;
    }
  };

  // Check if email has a seller account but not logged in as that seller
  const checkSellerEmail = async (email) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sellers/check-email?email=${email}`);
      return response.data.exists;
    } catch (error) {
      console.error("Error checking seller email:", error);
      return false;
    }
  };

  // Helper to check if user is logged in as seller
  const isLoggedInAsSeller = () => {
    return seller !== null;
  };

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

      const response = await axios.patch(`${API_BASE_URL}/api/sellers/${sellerId}`, sellerData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.data) {
        setSeller(response.data.data);
        console.log("[SellerContext] Seller updated:", response.data.data);
        toast.success(response.data.message || "Seller information updated successfully!");
        return response.data.data;
      } else if (response.data) {
        setSeller(response.data);
        console.log("[SellerContext] Seller updated:", response.data);
        toast.success(response.data.message || "Seller information updated successfully!");
        return response.data;
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
    // Note: This doesn't remove the token, as the user is still logged in
    toast.success("Successfully logged out from seller account!");
    return true;
  };


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
    }}>
      {children}
    </SellerContext.Provider>
  );
};

export default SellerContextProvider;