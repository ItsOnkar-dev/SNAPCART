import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Heart,
  Minus,
  Plus,
  Shield,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useCartContext from "../context/Cart/useCartContext";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartItemsCount,
    clearCart,
    addToWishlist,
  } = useCartContext();

  // Calculate shipping (free over ₹1000)
  const shipping = cartTotal >= 1000 ? 0 : 50;
  const tax = cartTotal * 0.18; // 18% GST
  const finalTotal = cartTotal + shipping + tax;

  const handleQuantityChange = (item, change) => {
    const newQuantity = (item.qty || 1) + change;
    updateQuantity(item._id || item.title, newQuantity);
  };

  const handleRemove = (item) => {
    removeFromCart(item._id || item.title);
  };

  const handleSaveForLater = (item) => {
    // Add to wishlist first
    addToWishlist(item);
    // Remove from cart (this will show a toast, but we'll override it with our message)
    // We remove it after a small delay to ensure wishlist is updated first
    setTimeout(() => {
      removeFromCart(item._id || item.title);
      // Show a friendly "saved for later" message instead of the default "removed" message
      toast.success(`${item.title} saved for later! 💝`, {
        autoClose: 2000,
      });
    }, 100);
  };

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 pt-32 px-4 ">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="relative inline-block mb-8">
              <ShoppingBag className="w-32 h-32 text-gray-300 dark:text-slate-600 mx-auto" />
              <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Your cart is empty
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between my-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  Shopping Cart
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {cartItemsCount} {cartItemsCount === 1 ? "item" : "items"} in
                  your cart
                </p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item, index) => (
                <motion.div
                  key={item._id || item.title || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="relative flex-shrink-0 w-full sm:w-32 h-32 bg-gray-100 dark:bg-slate-700 rounded-xl overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                          {item.qty || 1}x
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                ₹ {item.price?.toLocaleString("en-IN") || 0}
                              </span>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemove(item)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Quantity
                          </span>
                          <div className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleQuantityChange(item, -1)}
                              disabled={item.qty <= 1}
                              className="p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                              {item.qty || 1}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleQuantityChange(item, 1)}
                              className="p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Item Total
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              ₹{" "}
                              {(
                                (item.price || 0) * (item.qty || 1)
                              ).toLocaleString("en-IN")}
                            </span>
                          </div>

                          {/* Save for Later Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSaveForLater(item)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            <Heart className="w-4 h-4" />
                            Save for Later
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sticky top-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({cartItemsCount} items)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₹ {cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      <>₹ {shipping}</>
                    )}
                  </span>
                </div>

                {shipping > 0 && (
                  <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                    Add ₹ {(1000 - cartTotal).toLocaleString("en-IN")} more for
                    free shipping!
                  </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (GST 18%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₹ {tax.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹ {finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Truck className="w-5 h-5 text-blue-500" />
                  <span>Free delivery on orders over ₹1000</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Secure payment & buyer protection</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  <span>Multiple payment options</span>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                onClick={() => {
                  toast.info("Checkout functionality coming soon!", {
                    position: "top-center",
                    autoClose: 2000,
                  });
                  // TODO: Navigate to checkout page when implemented
                  // navigate("/checkout");
                }}
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </motion.button>

              {/* Continue Shopping */}
              <button
                onClick={() => navigate("/")}
                className="w-full mt-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
