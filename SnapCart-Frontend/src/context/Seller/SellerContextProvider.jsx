/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import SellerContext from "./SellerContext";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SellerContextProvider = ({ children }) => {
  const [sellers, setSellers] = useState([]);
  const [seller, setSeller] = useState(null);
  const [isSellerLoading, setIsSellerLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Base API URL - make it configurable
  const API_BASE_URL = "http://localhost:8000";

  // Fetch all sellers on mount
  useEffect(() => {
    const fetchSellers = async () => {
      setIsSellerLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/sellers`);
        console.log("Fetched Sellers Successfully", response.data);
        setSellers(response.data);
      } catch (error) {
        console.error("An error occurred fetching sellers:", error);
        // Only set error if it's not a "not found" error
        if (error.response && error.response.status !== 404) {
          const errorMsg = error.response?.message || `Server error: ${error.response?.status}`;
          setErrors({ submit: errorMsg });
          toast.error(errorMsg);
        }
      } finally {
        setIsSellerLoading(false);
      }
    };

    fetchSellers();
  }, []);

  // Try to fetch current seller if user is logged in
  // useEffect(() => {
  //   const fetchCurrentSeller = async () => {
  //     setIsSellerLoading(true);
  //     try {
  //       // Note: This endpoint requires authentication
  //       const response = await axios.get(`${API_BASE_URL}/sellers/current`);
  //       console.log("Fetched Current Seller Successfully", response.data.data);
  //       setSeller(response.data.data);
  //     } catch (error) {
  //       console.log("User is not a seller yet or not logged in", error);
  //       // Not setting error because this is normal for non-sellers
  //     } finally {
  //       setIsSellerLoading(false);
  //     }
  //   };

  //   fetchCurrentSeller();
  // }, []);

  // Create new seller
  const createSeller = async (sellerData) => {
    try {
      // Add validation
      if (!sellerData.name || !sellerData.email || !sellerData.storeName || !sellerData.storeDescription) {
        throw new Error("Missing required fields: name, email, storeName, and storeDescription are required");
      }

      console.log("Creating seller with data:", sellerData);
      const response = await axios.post(`${API_BASE_URL}/sellers`, sellerData);
      console.log("Seller created successfully:", response.data);
      setSeller(response.data.data);
      toast.success("Seller account created successfully!");
      return response.data.data;
    } catch (error) {
      console.error("An error occurred:", error);
      let errorMsg;
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      } else {
        errorMsg = "Failed to create seller account";
      }
      
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
      throw error;
    }
  };

  // Update seller information
  const updateSeller = async (sellerId, sellerData) => {
    try {
      if (!sellerId) {
        throw new Error("Seller ID is required to update seller information");
      }
      
      const response = await axios.patch(`${API_BASE_URL}/sellers/${sellerId}`, sellerData);
      setSeller(response.data.data);
      toast.success("Seller information updated successfully!");
      return response.data.data;
    } catch (error) {
      console.error("An error occurred:", error);
      const errorMsg = error.response?.data?.message || "Failed to update seller information";
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
      throw error;
    }
  };

  return (
    <SellerContext.Provider value={{ 
      sellers,
      seller, 
      setSeller, 
      isSellerLoading,
      errors, 
      setErrors,
      createSeller,
      updateSeller
    }}>
      {children}
    </SellerContext.Provider>
  );
};

export default SellerContextProvider;