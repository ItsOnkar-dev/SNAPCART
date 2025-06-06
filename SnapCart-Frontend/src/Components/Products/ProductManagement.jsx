import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useProductContext from "../../context/Product/useProductContext";
import useSellerContext from "../../context/Seller/useSellerContext";
import DeleteModal from "../Modals/DeleteModal";
import DeleteSellerModal from "../Modals/Seller/DeleteSellerModal";
import SellerNavbar from "../Navigation/SellerNavBar";

const ProductManagement = ({ isDark, toggleDarkMode }) => {
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    image: "",
    price: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleteSellerModalOpen, setIsDeleteSellerModalOpen] = useState(false);
  const productFormRef = useRef(null);

  const navigate = useNavigate();

  // Get product and seller context
  const {
    sellerProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchSellerProducts,
  } = useProductContext();
  const { seller, logoutSeller } = useSellerContext();

  // Fetch products when seller data is available
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      if (seller?._id && isMounted) {
        try {
          console.log("Fetching products for seller:", seller._id);
          const result = await fetchSellerProducts();
          console.log("Fetched products result:", result);
        } catch (error) {
          console.error("Error loading products:", error);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [seller?._id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    try {
      console.log("Creating product with data:", newProduct);
      const result = await addProduct(newProduct);
      console.log("Create product result:", result);

      if (result.success) {
        toast.success("Product created successfully!");
        // Clear form or reset state as needed
        setNewProduct({
          title: "",
          description: "",
          image: "",
          price: "",
        });
        // Refetch products after successful creation
        await fetchSellerProducts();
      } else {
        toast.error(result.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error.message || "Failed to create product");
    }
  };

  const scrollToForm = () => {
    productFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEditClick = (product) => {
    setEditMode(true);
    setSelectedProduct(product);
    setNewProduct({
      title: product.title,
      description: product.description,
      image: product.image,
      price: product.price,
    });

    scrollToForm();
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!selectedProduct) return;

    const result = await updateProduct(selectedProduct._id, newProduct);

    if (result.success) {
      setNewProduct({ title: "", description: "", image: "", price: "" });
      setEditMode(false);
      setSelectedProduct(null);
      toast.success("Product updated successfully!");
      // Refetch products after successful update
      await fetchSellerProducts();
    } else {
      toast.error(result.error || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    setProductToDelete(productId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      const result = await deleteProduct(productToDelete);
      if (result.success) {
        toast.success("Product deleted successfully!");
        // Refetch products after successful deletion
        await fetchSellerProducts();
      } else {
        toast.error(result.error || "Failed to delete product");
      }
    }
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const resetForm = () => {
    setEditMode(false);
    setSelectedProduct(null);
    setNewProduct({ title: "", description: "", image: "", price: "" });
  };

  const handleLogout = () => {
    logoutSeller();
    navigate("/become-seller");
  };

  return (
    <>
      <SellerNavbar isDark={isDark} toggleDarkMode={toggleDarkMode} />
      <div className="min-h-screen mt-16 pt-6 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto p-6 md:p-8 max-w-7xl">
          {/* Header Section with Stats */}
          <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2 items-center md:items-start">
              <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400">
                Product Management
              </h1>
              {seller && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient flex items-center justify-center text-white text-xl font-bold">
                      {seller.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-600 dark:text-white/70">
                        Welcome back,{" "}
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          {seller.username}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage your products with ease
                      </p>
                    </div>
                  </div>
                  {/* Mobile-only buttons */}
                  <div className="flex sm:hidden items-center justify-center gap-4 mt-4">
                    <button
                      onClick={handleLogout}
                      className="px-4 py-1.5 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-600 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-md transition-colors"
                    >
                      Logout
                    </button>

                    <button
                      onClick={() => setIsDeleteSellerModalOpen(true)}
                      className="px-4 py-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
              <p className="text-gray-600 dark:text-white/70 max-w-2xl mt-4">
                Create, update, and manage your product inventory with ease. Add
                detailed descriptions and attractive images to showcase your
                offerings to potential customers.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {sellerProducts.length > 0 && (
                <button
                  onClick={scrollToForm}
                  className="group bg-gradient text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add New Product
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border-l-4 border-blue-500 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Total Products
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {sellerProducts.length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border-l-4 border-green-500 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Active Products
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {sellerProducts.length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border-l-4 border-purple-500 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Total Value
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    ₹
                    {sellerProducts
                      .reduce((sum, product) => sum + Number(product.price), 0)
                      .toFixed(2)}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Product List Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                Your Products
                <span className="ml-3 inline-flex items-center justify-center px-3 py-1 text-sm font-bold leading-none text-blue-100 bg-blue-500 rounded-full">
                  {Array.isArray(sellerProducts) ? sellerProducts.length : 0}
                </span>
              </h2>
              {sellerProducts.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Click on a product to edit or delete</span>
                </div>
              )}
            </div>

            {Array.isArray(sellerProducts) && sellerProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sellerProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 border-b-4 border-transparent hover:border-blue-500"
                  >
                    <div className="relative h-56 overflow-hidden group">
                      <img
                        src={product.image || "/api/placeholder/300/200"}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 transform group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/api/placeholder/300/200";
                        }}
                      />
                      <div className="absolute top-0 right-0 mt-4 mr-4">
                        <span className="bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
                          ₹{product.price}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">
                        {product.title}
                      </h3>
                      <p className="text-slate-600 dark:text-white/60 mb-4 line-clamp-3">
                        {product.description}
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="flex-1 bg-gradient-to-r from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex-1 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow-md p-12 text-center">
                <div className="text-blue-500 dark:text-blue-400 mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-24 w-24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-white mb-3">
                  No Products Found
                </h3>
                <p className="text-gray-500 dark:text-gray-300 mb-8 max-w-md">
                  You haven&apos;t created any products yet. Get started by
                  creating your first product above!
                </p>
                <button
                  onClick={scrollToForm}
                  className="bg-gradient text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create Your First Product
                </button>
              </div>
            )}
          </div>

          {/* Create/Edit Product Form */}
          <div
            ref={productFormRef}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 mb-12 transition-all duration-300 transform hover:shadow-2xl border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                {editMode ? (
                  <>
                    <span className="text-blue-600 dark:text-blue-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 inline mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </span>
                    Edit Product: {selectedProduct?.title}
                  </>
                ) : (
                  <>
                    <span className="text-green-600 dark:text-green-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 inline mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </span>
                    Create New Product
                  </>
                )}
              </h2>
              {editMode && (
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            <form
              onSubmit={editMode ? handleUpdateProduct : handleCreateProduct}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label
                    htmlFor="title"
                    className="block text-gray-700 dark:text-white/80 text-sm font-semibold mb-2"
                  >
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newProduct.title}
                    onChange={handleInputChange}
                    className="shadow-sm appearance-none border border-gray-300 dark:border-gray-500 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-white/80 dark:bg-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="price"
                    className="block text-gray-700 dark:text-white/80 text-sm font-semibold mb-2"
                  >
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    className="shadow-sm appearance-none border border-gray-300 dark:border-gray-500 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-white dark:bg-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label
                    htmlFor="image"
                    className="block text-gray-700 dark:text-white/80 text-sm font-semibold mb-2"
                  >
                    Image URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={newProduct.image}
                    onChange={handleInputChange}
                    className="shadow-sm appearance-none border border-gray-300 dark:border-gray-500 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-white dark:bg-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter a valid URL for your product image
                  </p>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-gray-700 dark:text-white/80 text-sm font-semibold mb-2"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="shadow-sm appearance-none border border-gray-300 dark:border-gray-500 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-white dark:bg-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500"
                      : "bg-gradient"
                  } text-white font-bold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1 flex items-center`}
                >
                  {editMode ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      Update Product
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Create Product
                    </>
                  )}
                </button>

                {editMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />
      <DeleteSellerModal
        isOpen={isDeleteSellerModalOpen}
        onClose={() => setIsDeleteSellerModalOpen(false)}
      />
    </>
  );
};

ProductManagement.propTypes = {
  isDark: PropTypes.bool.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
};

export default ProductManagement;
