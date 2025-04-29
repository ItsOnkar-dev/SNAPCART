import { useState, useEffect, useContext } from 'react';
import SellerContext from '../../context/Seller/SellerContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    image: '',
    price: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { seller } = useContext(SellerContext);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/products'); 
        // Ensure response.data is an array
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else if (response.data && Array.isArray(response.data.products)) {
          // Handle case where response might have a 'products' property
          setProducts(response.data.products);
        } else {
          console.error('Expected array in response data', response.data);
          setProducts([]);
        }
      } catch (error) {
        console.error('An error occurred fetching products:', error);
        toast.error('Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      // Send the product data with the POST request
      const response = await axios.post('http://localhost:8000/api/products', newProduct);
      
      if (response.data) {
        setProducts([...products, response.data]);
        setNewProduct({ title: '', description: '', image: '', price: '' });
        toast.success('Product created successfully!');
      } else {
        toast.error('Unexpected response format when creating product');
      }
    } catch (error) {
      toast.error('An error occurred while creating the product.');
      console.error('An error occurred:', error);
    }
  };

  const handleEditClick = (product) => {
    setEditMode(true);
    setSelectedProduct(product);
    setNewProduct({
        title: product.title,
        description: product.description,
        image: product.image,
        price: product.price
    });
    
    // Scroll to form
    document.querySelector('.product-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      // Send the updated product data with the PUT request
      const response = await axios.put(
        `http://localhost:8000/api/products/${selectedProduct._id}`,
        newProduct
      );
      
      if (response.data) {
        setProducts(
          products.map((product) =>
            product._id === selectedProduct._id ? response.data : product
          )
        );
        toast.success('Product updated successfully!');
        setEditMode(false);
        setSelectedProduct(null);
        setNewProduct({ title: '', description: '', image: '', price: '' });
      } else {
        toast.error('Unexpected response format when updating product');
      }
    } catch (error) {
      toast.error('An error occurred while updating the product.');
      console.error('An error occurred:', error);
    }
  };

  const handleDeleteClick = async (product) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`http://localhost:8000/api/products/${product._id}`);
      setProducts(products.filter((p) => p._id !== product._id));
      toast.success('Product deleted successfully!');
    } catch (error) {
      toast.error('An error occurred while deleting the product.');
      console.error('An error occurred:', error);
    }
  };

  const resetForm = () => {
    setEditMode(false);
    setSelectedProduct(null);
    setNewProduct({ title: '', description: '', image: '', price: '' });
  };

  if (!seller) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse bg-white p-8 rounded-lg shadow-lg">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="container mx-auto p-6 md:p-8">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">Product Management</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create, update, and manage your product inventory with ease. Add detailed descriptions and attractive images to showcase your offerings.
          </p>
        </div>
        
        {/* Create/Edit Product Form */}
        <div className="product-form bg-white rounded-xl shadow-xl p-6 mb-12 transition-all duration-300 transform">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 flex items-center">
            {editMode ? (
              <>
                <span className="text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </span>
                Edit Product: {selectedProduct?.title}
              </>
            ) : (
              <>
                <span className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </span>
                Create New Product
              </>
            )}
          </h2>
          
          <form onSubmit={editMode ? handleUpdateProduct : handleCreateProduct}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="title" className="block text-gray-700 text-sm font-semibold mb-2">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newProduct.title}
                  onChange={handleInputChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="price" className="block text-gray-700 text-sm font-semibold mb-2">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="space-y-1 md:col-span-2">
                <label htmlFor="image" className="block text-gray-700 text-sm font-semibold mb-2">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={newProduct.image}
                  onChange={handleInputChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://example.com/image.jpg"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter a valid URL for your product image</p>
              </div>
              
              <div className="space-y-1 md:col-span-2">
                <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Describe your product in detail..."
                  required
                />
              </div>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="submit"
                className={`${
                  editMode 
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                } text-white font-bold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 flex items-center`}
              >
                {editMode ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Update Product
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Product
                  </>
                )}
              </button>
              
              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Product List Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Your Products
            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-100 bg-blue-600 rounded-full">
              {Array.isArray(products) ? products.length : 0}
            </span>
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-5">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2.5"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2.5"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="mt-6 flex justify-between">
                      <div className="h-10 bg-gray-200 rounded w-20"></div>
                      <div className="h-10 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : Array.isArray(products) && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="relative h-56 bg-gray-200 overflow-hidden">
                    <img 
                      src={product.image || '/api/placeholder/300/200'} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-500 transform hover:scale-110" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/api/placeholder/300/200';
                      }}
                    />
                    <div className="absolute top-0 right-0 mt-4 mr-4">
                      <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                        ${product.price}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{product.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-6 max-w-md">You haven&apos;t created any products yet. Get started by creating your first product above!</p>
              <button 
                onClick={() => document.querySelector('.product-form').scrollIntoView({ behavior: 'smooth' })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;