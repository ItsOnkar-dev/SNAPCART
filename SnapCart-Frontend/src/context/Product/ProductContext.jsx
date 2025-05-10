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
      
      // Handle different response structures
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setProducts(res.data.data);
      } else if (res.data && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        console.error('Unexpected response format:', res.data);
        setProducts([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
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
      if (response.data) {
        setProducts([...products, response.data]);
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Unexpected response format' };
    } catch (err) {
      console.error('Error adding product:', err);
      return { success: false, error: err.message || 'Failed to add product' };
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
      return { success: false, error: 'Unexpected response format' };
    } catch (err) {
      console.error('Error updating product:', err);
      return { success: false, error: err.message || 'Failed to update product' };
    }
  };

  // Delete a product
  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:8000/api/products/${productId}`);
      setProducts(products.filter(product => product._id !== productId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      return { success: false, error: err.message || 'Failed to delete product' };
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