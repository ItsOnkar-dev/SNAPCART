/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import SellerContext from "./SellerContext";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SellerContextProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [isSellerLoading, setIsSellerLoading] = useState(true);
  const [unapprovedSellers, setUnapprovedSellers] = useState([]);
  const [approvedSellers, setApprovedSellers] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch seller data on mount
  useEffect(() => {
    const fetchSellerData = async () => {
      setIsSellerLoading(true);
      try {
        const response = await axios.get("http://localhost:8000/sellers");
        console.log("Fetched Seller Data Successfully", response.data.data);
        setSeller(response.data.data);
      } catch (error) {
        console.error("An error occurred:", error);
        // Only set error if it's not a "not found" error (which is expected for non-sellers)
        if (error.response && error.response.status !== 404) {
          const errorMsg = error.response?.data?.message || `Server error: ${error.response?.status}`;
          setErrors({ submit: errorMsg });
          toast.error(errorMsg);
        }
      } finally {
        setIsSellerLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  // Admin functionality: Fetch unapproved sellers
  useEffect(() => {
    const fetchUnapprovedSellers = async () => {
      // Only fetch if the current user is a seller (potential admin)
      if (!seller) return;
      
      try {
        const response = await axios.get("http://localhost:8000/admin/sellers");
        console.log("Fetched unapproved sellers data:", response.data.data);
        setUnapprovedSellers(response.data.data);
      } catch (error) {
        console.error("An error occurred:", error);
        if (error.response) {
          setErrors({ submit: error.response.data.message || `Server error: ${error.response.status}` });
        } else if (error.request) {
          setErrors({ submit: "No response from server. Please check your connection and try again." });
        } else {
          setErrors({ submit: "An error occurred while fetching seller data. Please try again." });
        }
      }
    };
    
    fetchUnapprovedSellers();
  }, [seller]);

  // Create new seller
  const createSeller = async (sellerData) => {
    try {
      const response = await axios.post("http://localhost:8000/sellers", sellerData);
      setSeller(response.data.data);
      toast.success("Seller account created successfully!");
      return response.data.data;
    } catch (error) {
      console.error("An error occurred:", error);
      const errorMsg = error.response?.data?.message || "Failed to create seller account";
      toast.error(errorMsg);
      throw error;
    }
  };

  // Update seller information
  const updateSeller = async (sellerData) => {
    try {
      const response = await axios.patch(`http://localhost:8000/sellers/${seller._id}`, sellerData);
      setSeller(response.data.data);
      toast.success("Seller information updated successfully!");
      return response.data.data;
    } catch (error) {
      console.error("An error occurred:", error);
      const errorMsg = error.response?.data?.message || "Failed to update seller information";
      toast.error(errorMsg);
      throw error;
    }
  };

  // Admin: Approve a seller
  const handleApproveSeller = async (sellerId) => {
    try {
      const response = await axios.post(`http://localhost:8000/admin/sellers/${sellerId}/approve`);
      console.log("Seller approved successfully", response.data.data);
      setUnapprovedSellers((prev) => prev.filter((seller) => seller._id !== sellerId));
      setApprovedSellers((prev) => [...prev, response.data.data]);
      toast.success("Seller approved successfully!");
      return response.data.data;
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("Failed to approve seller");
      throw error;
    }
  };

  return (
    <SellerContext.Provider value={{ 
      seller, 
      setSeller, 
      isSellerLoading,
      errors, 
      setErrors, 
      handleApproveSeller, 
      unapprovedSellers, 
      approvedSellers,
      createSeller,
      updateSeller
    }}>
      {children}
    </SellerContext.Provider>
  );
};

export default SellerContextProvider;