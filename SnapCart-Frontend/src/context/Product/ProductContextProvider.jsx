import axios from "axios";
import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import ProductContext from "./ProductContext";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ProductContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchProductsPromiseRef = useRef(null);
  const hasFetchedRef = useRef(false);

  // Fetch all products (public) with request deduplication
  const fetchProducts = useCallback(async (forceRefresh = false) => {
    // If already fetching, return the existing promise
    if (fetchProductsPromiseRef.current && !forceRefresh) {
      return fetchProductsPromiseRef.current;
    }

    // If already fetched and not forcing refresh, skip
    if (hasFetchedRef.current && !forceRefresh) {
      setLoading(false);
      return;
    }

    const fetchPromise = (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/products`, {
          // Add cache control to prevent unnecessary requests
          headers: {
            "Cache-Control": "no-cache",
          },
          timeout: 10000, // 10 seconds timeout
        });
        if (res.data && Array.isArray(res.data.data)) {
          setProducts(res.data.data);
          setError(null);
          hasFetchedRef.current = true;
        } else {
          setProducts([]);
          setError(res.data?.message || "Unexpected response format");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load products. Please try again."
        );
        setProducts([]);
      } finally {
        setLoading(false);
        fetchProductsPromiseRef.current = null;
      }
    })();

    fetchProductsPromiseRef.current = fetchPromise;
    return fetchPromise;
  }, []);

  // Fetch products for the logged-in seller
  const fetchSellerProducts = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, cannot fetch seller products");
      setSellerProducts([]);
      return { success: false, error: "Authentication required" };
    }

    try {
      // Don't set global loading for seller products to avoid blocking UI
      console.log("Fetching seller products with token:", token);
      // Use the my-products endpoint which uses the token to identify the seller
      const res = await axios.get(`${API_BASE_URL}/api/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000, // 10 seconds timeout
      });

      console.log("Seller products response:", res.data);

      if (res.data && Array.isArray(res.data.data)) {
        setSellerProducts(res.data.data);
        setError(null);
        return { success: true, data: res.data.data };
      } else {
        console.error("Unexpected response format:", res.data);
        setSellerProducts([]);
        setError(res.data?.message || "Unexpected response format");
        return {
          success: false,
          error: res.data?.message || "Unexpected response format",
        };
      }
    } catch (err) {
      console.error("Error fetching seller products:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load your products. Please try again."
      );
      setSellerProducts([]);
      return {
        success: false,
        error: err.response?.data?.message || "Failed to load products",
      };
    }
  }, []);

  // Get a single product by ID (from public list)
  const getProductById = (productId) => {
    if (!productId) return null;
    return products.find((product) => product && product._id === productId);
  };

  // Add a new product (seller only)
  const addProduct = async (productData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, cannot add product");
      return { success: false, error: "Authentication required" };
    }

    try {
      console.log("Adding product with data:", productData);
      const response = await axios.post(
        `${API_BASE_URL}/api/products`,
        productData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Add product response:", response.data);

      if (response.data && response.data.data) {
        // Update the sellerProducts state immediately with the new product
        setSellerProducts((prevProducts) => [
          ...prevProducts,
          response.data.data,
        ]);
        // Also update the public products list
        setProducts((prevProducts) => [...prevProducts, response.data.data]);
        return { success: true, data: response.data.data };
      } else {
        console.error("Unexpected response format:", response.data);
        return {
          success: false,
          error: response.data?.message || "Failed to add product",
        };
      }
    } catch (err) {
      console.error("Error adding product:", err);
      return {
        success: false,
        error: err.response?.data?.message || "Failed to add product",
      };
    }
  };

  // Update an existing product (seller only)
  const updateProduct = async (productId, productData) => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found, cannot update product");
      return { success: false, error: "Authentication required" };
    }

    if (!productId) {
      return { success: false, error: "Product ID is required" };
    }

    try {
      console.log(`Updating product ${productId} with data:`, productData);
      const response = await axios.patch(
        `${API_BASE_URL}/api/products/${productId}`,
        {
          ...productData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Update product response:", response.data);

      if (response.data && response.data.data) {
        // Re-fetch both seller products and public products to ensure state is in sync with backend
        await Promise.all([fetchSellerProducts(), fetchProducts(true)]);
        return { success: true, data: response.data.data };
      } else {
        return {
          success: false,
          error: response.data?.message || "Failed to update product",
        };
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed to update product",
      };
    }
  };

  // Delete a product (seller only)
  const deleteProduct = async (productId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return { success: false, error: "Authentication required" };
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.status === "success") {
        // Re-fetch both seller products and public products to ensure state is in sync with backend
        await Promise.all([fetchSellerProducts(), fetchProducts(true)]);
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data?.message || "Failed to delete product",
        };
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed to delete product",
      };
    }
  };

  // Get related products (excluding the current product)
  const getRelatedProducts = (currentProductId, limit = 4) => {
    return products
      .filter((product) => product._id !== currentProductId)
      .slice(0, limit);
  };

  // Load all products on mount (only once)
  useEffect(() => {
    fetchProducts();
    // We'll load seller products in the ProductManagement component when needed
  }, [fetchProducts]);

  // Listen for seller deletion event
  useEffect(() => {
    const handleSellerDeleted = () => {
      console.log("Seller deleted, refreshing products");
      fetchProducts(true); // Force refresh when seller is deleted
    };

    window.addEventListener("sellerDeleted", handleSellerDeleted);

    return () => {
      window.removeEventListener("sellerDeleted", handleSellerDeleted);
    };
  }, [fetchProducts]);

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

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

ProductContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProductContextProvider;
