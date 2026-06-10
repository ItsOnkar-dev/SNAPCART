import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Store, 
  Phone, 
  MapPin, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp
} from "lucide-react";
import { toast } from "react-toastify";
import useUserContext from "../context/User/useUserContext";
import useSellerContext from "../context/Seller/useSellerContext";

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, fetchUserProfile } = useUserContext();
  const { createSeller } = useSellerContext();

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    phone: "",
    businessAddress: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already a seller, redirect them directly to their dashboard
  useEffect(() => {
    if (isLoggedIn && user && user.role === "Seller") {
      navigate("/seller/dashboard", { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStartSelling = () => {
    if (!isLoggedIn) {
      toast.warning("Please login first to become a seller");
      navigate("/registration");
      return;
    }
    setIsOnboarding(true);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.businessName || !formData.phone) {
        toast.error("Please fill in your business name and contact number");
        return;
      }
      if (formData.phone.length < 10) {
        toast.error("Please enter a valid phone number");
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.businessAddress) {
      toast.error("Please fill in your business address");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createSeller(formData);
      if (response) {
        // Refresh primary user context so user's role is updated to Seller on the client
        await fetchUserProfile();
        setStep(3);
      }
    } catch (error) {
      console.error("Failed to upgrade user profile to seller:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!isOnboarding ? (
            /* Marketing Page */
            <motion.div
              key="marketing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 mb-6">
                <Store className="w-12 h-12" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                Grow Your Business. <span className="text-gradient">Sell on SnapCart</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                Join thousands of merchants, reach millions of active buyers, and scale your brand with our premium seller infrastructure.
              </p>

              <div className="flex justify-center gap-4 mb-16">
                <button
                  onClick={handleStartSelling}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Start Selling Today <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700/50 flex flex-col items-center">
                  <ShieldCheck className="w-10 h-10 text-green-500 mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Secure Payments</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Fast, protected payouts directly to your account.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700/50 flex flex-col items-center">
                  <Zap className="w-10 h-10 text-yellow-500 mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Easy Setup</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Register in minutes and list your catalog instantly.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700/50 flex flex-col items-center">
                  <TrendingUp className="w-10 h-10 text-purple-500 mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Scale Smart</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Robust analytics tools to monitor performance and sales.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Onboarding Wizard */
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700/30 overflow-hidden"
            >
              {/* Onboarding Header */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => step === 1 ? setIsOnboarding(false) : setStep(1)} 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <span className="font-bold text-lg">Seller Account Setup</span>
                </div>
                <div className="flex gap-1">
                  <span className={`w-2 h-2 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-200"}`}></span>
                  <span className={`w-2 h-2 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></span>
                  <span className={`w-2 h-2 rounded-full ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></span>
                </div>
              </div>

              <div className="p-8 sm:p-10">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Tell us about your brand</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Let\'s start with your store name and contact number.</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                            <Store className="w-4 h-4" /> Store / Business Name
                          </label>
                          <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleInputChange}
                            placeholder="e.g. Apex Tech Store"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                            <Phone className="w-4 h-4" /> Business Phone Number
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="e.g. 9876543210"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleNextStep}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Store Address</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Where should customers and shipping services reach your store?</p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> Full Business Address
                          </label>
                          <textarea
                            name="businessAddress"
                            value={formData.businessAddress}
                            onChange={handleInputChange}
                            rows="4"
                            placeholder="e.g. Suite 400, Horizon Towers, BKC, Mumbai - 400051"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSubmitting ? "Upgrading your profile..." : "Confirm & Setup Store"}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6 flex flex-col items-center"
                    >
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Your Store is Ready!</h2>
                      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
                        Welcome to SnapCart! Your account has been upgraded to a Seller. You can now manage and add products to your storefront.
                      </p>
                      <button
                        onClick={() => navigate("/seller/dashboard")}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                      >
                        Enter Seller Dashboard
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BecomeSeller;
