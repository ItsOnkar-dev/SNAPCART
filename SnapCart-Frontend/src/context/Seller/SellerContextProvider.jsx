/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import SellerContext from "./SellerContext";
import axios from "axios";

const SellerContextProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/sellers");
        setSeller(response.data);
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

    fetchSellerData();
  }, []);

  return (
    <SellerContext.Provider value={{ seller, setSeller, errors, setErrors }}>
      {children}
    </SellerContext.Provider>
  );
};

export default SellerContextProvider;