import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  Truck, 
  ShoppingBag, 
  Lock,
  Loader
} from "lucide-react";
import { toast } from "react-toastify";
import useCartContext from "../context/Cart/useCartContext";
import axiosInstance from "../config/axios";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, cartItemsCount, clearCart } = useCartContext();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India"
  });

  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!address.street || !address.city || !address.state || !address.zipCode) {
        toast.error("Please fill in all shipping details");
        return;
      }
      setStep(2);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!payment.cardNumber || !payment.expiry || !payment.cvv) {
      toast.error("Please fill in all card details");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post("/api/orders", {
        shippingAddress: address,
        paymentMethod: "Credit Card"
      });

      if (response.data?.status === "success" && response.data?.data) {
        setOrderId(response.data.data._id);
        // Force cart state to empty in context
        clearCart();
        setStep(3);
      }
    } catch (error) {
      console.error("Order submission failed:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations
  const shipping = cartTotal >= 1000 ? 0 : 50;
  const tax = cartTotal * 0.18;
  const finalTotal = cartTotal + shipping + tax;

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 pt-32 px-4 flex flex-col items-center">
        <ShoppingBag className="w-24 h-24 text-gray-300 dark:text-slate-600 mb-6" />
        <h2 className="text-3xl font-bold mb-4">No items to checkout</h2>
        <button 
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-md"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Step Indicator Header */}
        {step < 3 && (
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => step === 2 ? setStep(1) : navigate("/cart")}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 2 ? "Back to Shipping" : "Back to Cart"}
            </button>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>1</span>
              <span className="h-0.5 w-10 bg-gray-300 dark:bg-slate-700"></span>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>2</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl"
                >
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                    <MapPin className="text-blue-500" /> Shipping Address
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Street Address</label>
                      <input
                        type="text"
                        name="street"
                        value={address.street}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 123 Main St, Apartment 4B"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={address.city}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Mumbai"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">State</label>
                        <input
                          type="text"
                          name="state"
                          value={address.state}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Maharashtra"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">ZIP / Postal Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={address.zipCode}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="400001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={address.country}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="India"
                        />
                      </div>
                    </div>
                    <button
                      onClick={nextStep}
                      className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl"
                >
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                    <CreditCard className="text-blue-500" /> Mock Payment Method
                  </h2>
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardName"
                        value={payment.cardName}
                        onChange={handlePaymentChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={payment.cardNumber}
                        onChange={handlePaymentChange}
                        maxLength="16"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="4111 2222 3333 4444"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          name="expiry"
                          value={payment.expiry}
                          onChange={handlePaymentChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">CVV</label>
                        <input
                          type="password"
                          name="cvv"
                          value={payment.cvv}
                          onChange={handlePaymentChange}
                          placeholder="***"
                          maxLength="3"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 p-3 rounded-lg mt-4">
                      <Lock className="w-4 h-4 flex-shrink-0" />
                      <span>This is a simulated transaction. Your card details are not saved nor verified for actual transactions.</span>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Processing mock payment...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Place Order (₹ {finalTotal.toFixed(2)})
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-3xl shadow-xl text-center col-span-3 flex flex-col items-center"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Order Confirmed!</h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                    Thank you for your purchase. Your order has been placed successfully.
                  </p>
                  {orderId && (
                    <div className="bg-gray-50 dark:bg-slate-900/50 px-6 py-3 rounded-xl text-sm font-mono text-gray-500 mb-8 select-all">
                      Order ID: {orderId}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => navigate("/")}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart Items Summary Panel (only visible for Step 1 & 2) */}
          {step < 3 && (
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl sticky top-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-3">
                  <ShoppingBag className="w-5 h-5 text-purple-500" /> Order Summary
                </h3>
                
                {/* Product List */}
                <div className="max-h-60 overflow-y-auto space-y-3 scrollbar-thin pr-1 mb-4">
                  {cart.map((item, idx) => (
                    <div key={item._id || idx} className="flex gap-3 items-center">
                      <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.qty || 1} x ₹ {item.price}</p>
                      </div>
                      <span className="text-sm font-bold">₹ {((item.price || 0) * (item.qty || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-slate-700 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({cartItemsCount} items)</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₹ {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : `₹ ${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>GST (18%)</span>
                    <span>₹ {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-bold pt-3 border-t border-dashed border-gray-200 dark:border-slate-600">
                    <span>Total</span>
                    <span className="text-xl text-blue-600 dark:text-blue-400">₹ {finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
