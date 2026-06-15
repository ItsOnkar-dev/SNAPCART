import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Edit2, Trash2, Package, Tag, IndianRupee, Image as ImageIcon } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useProductContext from "../../context/Product/useProductContext";
import useSellerContext from "../../context/Seller/useSellerContext";
import useScrollToElement from "../../hooks/useScrollToElement";
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

  const { ref: productFormRef, scrollToElement } = useScrollToElement({
    behavior: "smooth",
    block: "start",
  });

  const navigate = useNavigate();

  const {
    sellerProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchSellerProducts,
  } = useProductContext();
  const { seller, logoutSeller } = useSellerContext();

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      if (seller?._id && isMounted) {
        try {
          await fetchSellerProducts();
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
    e.preventDefault();
    try {
      const result = await addProduct(newProduct);
      if (result.success) {
        toast.success("Product created successfully!");
        setNewProduct({ title: "", description: "", image: "", price: "" });
        await fetchSellerProducts();
      } else {
        toast.error(result.error || "Failed to create product");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create product");
    }
  };

  const scrollToForm = () => {
    scrollToElement(100);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <SellerNavbar isDark={isDark} toggleDarkMode={toggleDarkMode} />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 md:px-10 font-sans text-slate-800 dark:text-slate-200">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10"
          >
            <div>
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => navigate("/")}
                  className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow text-slate-600 dark:text-slate-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Seller Dashboard
                </h1>
              </div>
              
              {seller && (
                <div className="mt-4 flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm inline-flex">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {seller.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Welcome back,</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                      {seller.username}
                    </p>
                  </div>
                  <div className="ml-4 pl-4 border-l border-slate-200 dark:border-slate-700 flex gap-2 hidden sm:flex">
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                    <button
                      onClick={() => setIsDeleteSellerModalOpen(true)}
                      className="px-3 py-1.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>

            {sellerProducts.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToForm}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-blue-500/20 transition-all"
              >
                <Plus size={20} />
                Add New Product
              </motion.button>
            )}
          </motion.div>

          {/* Quick Stats Section */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-between hover:shadow-md transition-shadow group">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Products</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">
                  {sellerProducts.length}
                </h3>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <Package className="text-blue-600 dark:text-blue-400" size={28} />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-between hover:shadow-md transition-shadow group">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Active Listings</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {sellerProducts.length}
                </h3>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <Tag className="text-emerald-600 dark:text-emerald-400" size={28} />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-between hover:shadow-md transition-shadow group">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Inventory Value</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white group-hover:text-purple-500 transition-colors">
                  ₹{sellerProducts.reduce((sum, product) => sum + Number(product.price), 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                <IndianRupee className="text-purple-600 dark:text-purple-400" size={28} />
              </div>
            </motion.div>
          </motion.div>

          {/* Product List Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                Your Inventory
                <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                  {sellerProducts.length}
                </span>
              </h2>
            </div>

            {sellerProducts.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {sellerProducts.map((product) => (
                  <motion.div
                    variants={itemVariants}
                    key={product._id}
                    className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <img
                        src={product.image || "/api/placeholder/300/200"}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 transform group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/api/placeholder/300/200";
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                        ₹{Number(product.price).toLocaleString()}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-white truncate">
                        {product.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 line-clamp-2 flex-grow">
                        {product.description}
                      </p>

                      <div className="flex gap-3 mt-auto">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-800/50"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-12 text-center"
              >
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                  <Package className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  No Products Yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                  Start building your inventory by adding your first product listing.
                </p>
                <button
                  onClick={scrollToForm}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add First Product
                </button>
              </motion.div>
            )}
          </div>

          {/* Form Section */}
          <motion.div
            ref={productFormRef}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 md:p-8 relative overflow-hidden ${
              editMode ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900" : ""
            }`}
          >
            {editMode && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            )}
            
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-700/50">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                {editMode ? (
                  <>
                    <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-2 rounded-xl">
                      <Edit2 size={24} />
                    </span>
                    Edit Listing
                  </>
                ) : (
                  <>
                    <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-2 rounded-xl">
                      <Plus size={24} />
                    </span>
                    Create Listing
                  </>
                )}
              </h2>
              {editMode && (
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-sm font-medium"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={editMode ? handleUpdateProduct : handleCreateProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold">
                    Product Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newProduct.title}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="E.g. Premium Wireless Headphones"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold">
                    Price (₹)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-medium">₹</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-2">
                    <ImageIcon size={16} className="text-slate-400" />
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={newProduct.image}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="Describe your product's features, benefits, and specifications..."
                    required
                  />
                </div>
              </div>

              <div className="mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold shadow-md text-white transition-all ${
                    editMode
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/20"
                      : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-500/20"
                  }`}
                >
                  {editMode ? "Save Changes" : "Publish Listing"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            title="Delete Listing"
            message="Are you sure you want to delete this product? This action cannot be undone."
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteSellerModalOpen && (
          <DeleteSellerModal
            isOpen={isDeleteSellerModalOpen}
            onClose={() => setIsDeleteSellerModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

ProductManagement.propTypes = {
  isDark: PropTypes.bool.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
};

export default ProductManagement;
