/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the context
const ProductContext = createContext();

// Create a custom hook to use the context
export const useProductContext = () => useContext(ProductContext);

// Create the provider component
export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8000/api/products');
      if (res.data && Array.isArray(res.data.data)) {
        setProducts(res.data.data);
      } else {
        setProducts([]);
        setError(res.data?.message || 'Unexpected response format');
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Get a single product by ID
  const getProductById = (productId) => {
    return products.find(product => product._id === productId);
  };

  // Add a new product
  const addProduct = async (productData) => {
    try {
      const response = await axios.post('http://localhost:8000/api/products', productData);
      if (response.data && response.data.data) {
        setProducts([...products, response.data.data]);
        return { success: true, data: response.data.data };
      }
      return { success: false, error: response.data?.message || 'Unexpected response format' };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add product' };
    }
  };

  // Update an existing product
  const updateProduct = async (productId, productData) => {
    try {
      const response = await axios.patch(`http://localhost:8000/api/products/${productId}`, productData);
      if (response.data && response.data.data) {
        setProducts(products.map(product => 
          product._id === productId ? response.data.data : product
        ));
        return { success: true, data: response.data.data };
      }
      return { success: false, error: response.data?.message || 'Unexpected response format' };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update product' };
    }
  };

  // Delete a product
  const deleteProduct = async (productId) => {
    try {
      const response = await axios.delete(`http://localhost:8000/api/products/${productId}`);
      if (response.data && response.data.status === 'success') {
        setProducts(products.filter(product => product._id !== productId));
        return { success: true };
      }
      return { success: false, error: response.data?.message || 'Failed to delete product' };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete product' };
    }
  };

  // Get related products (excluding the current product)
  const getRelatedProducts = (currentProductId, limit = 4) => {
    return products
      .filter(product => product._id !== currentProductId)
      .slice(0, limit);
  };

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Context value
  const value = {
    products,
    loading,
    error,
    fetchProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    getRelatedProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;