import { useState, useEffect } from "react";
import axios from "axios";
import ProductContext from "./ProductContext";
import PropTypes from "prop-types";

const ProductContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products (public)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/products");
      if (res.data && Array.isArray(res.data.data)) {
        setProducts(res.data.data);
      } else {
        setProducts([]);
        setError(res.data?.message || "Unexpected response format");
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for the logged-in seller
  const fetchSellerProducts = async () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      setSellerProducts([]);
      return { success: false, error: "Authentication required" };
    }

    try {
      setLoading(true);
      // Use the my-products endpoint which uses the token to identify the seller
      const res = await axios.get("http://localhost:8000/api/my-products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && Array.isArray(res.data.data)) {
        setSellerProducts(res.data.data);
        localStorage.setItem("sellerProducts", JSON.stringify(res.data.data));
        return { success: true, data: res.data.data };
      } else {
        setSellerProducts([]);
        setError(res.data?.message || "Unexpected response format");
        return { success: false, error: res.data?.message || "Unexpected response format" };
      }
    } catch (err) {
      // Try to load from cache if API call fails
      const cachedProducts = localStorage.getItem("sellerProducts");
      if (cachedProducts) {
        try {
          const parsedProducts = JSON.parse(cachedProducts);
          setSellerProducts(parsedProducts);
          return { success: true, data: parsedProducts, fromCache: true };
        } catch (err) {
          console.log(err);
          localStorage.removeItem("sellerProducts");
        }
      }

      setError(err.response?.data?.message || "Failed to load your products. Please try again.");
      setSellerProducts([]);
      return { success: false, error: err.response?.data?.message || "Failed to load products" };
    } finally {
      setLoading(false);
    }
  };

  // Load seller products on mount and when token changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const sellerData = localStorage.getItem("sellerData");

    if (token && sellerData) {
      fetchSellerProducts();
    }
    // Also load public products
    fetchProducts();
  }, []);

  // Get a single product by ID (from public list)
  const getProductById = (productId) => {
    if (!productId) return null;
    return products.find((product) => product && product._id === productId);
  };

  // Add a new product (seller only)
  const addProduct = async (productData) => {
    const token = window.localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    try {
      const response = await axios.post("http://localhost:8000/api/products", productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.data) {
        // Update the local state with the new product
        setSellerProducts((prev) => [...prev, response.data.data]);
        setProducts((prev) => [...prev, response.data.data]); // Optionally update public list
        return { success: true, data: response.data.data };
      }
      return { success: false, error: response.data?.message || "Unexpected response format" };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to add product" };
    }
  };

  // Update an existing product (seller only)
  const updateProduct = async (productId, productData) => {
    const token = window.localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    // Check if productId is valid
    if (!productId) {
      return { success: false, error: "Product ID is required" };
    }

    try {
      const response = await axios.patch(`http://localhost:8000/api/products/${productId}`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.data) {
        // Update the product in both seller products and all products arrays
        setSellerProducts((prev) => prev.map((product) => (product && product._id === productId ? response.data.data : product)));
        setProducts((prev) => prev.map((product) => (product && product._id === productId ? response.data.data : product)));
        return { success: true, data: response.data.data };
      }
      return { success: false, error: response.data?.message || "Unexpected response format" };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to update product" };
    }
  };

  // Delete a product (seller only)
  const deleteProduct = async (productId) => {
    const token = window.localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    try {
      const response = await axios.delete(`http://localhost:8000/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.status === "success") {
        // Remove the deleted product from both arrays
        setSellerProducts((prev) => prev.filter((product) => product._id !== productId));
        setProducts((prev) => prev.filter((product) => product._id !== productId));
        return { success: true };
      }
      return { success: false, error: response.data?.message || "Failed to delete product" };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to delete product" };
    }
  };

  // Get related products (excluding the current product)
  const getRelatedProducts = (currentProductId, limit = 4) => {
    return products.filter((product) => product._id !== currentProductId).slice(0, limit);
  };

  // Load all products on mount
  useEffect(() => {
    fetchProducts();
    // We'll load seller products in the ProductManagement component when we know the seller
  }, []);

  // Context value
  const value = {
    products, // public
    sellerProducts, // only for logged-in seller
    loading,
    error,
    fetchProducts,
    fetchSellerProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    getRelatedProducts,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

ProductContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProductContextProvider;
