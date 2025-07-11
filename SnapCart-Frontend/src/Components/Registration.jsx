/* eslint-disable no-unused-vars */
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Check,
  Gift,
  Shield,
  ShoppingBag,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Register from "../Pages/Register";
import SnapCartLogo from "../assets/SnapCart.png";
import SnapCartLogo1 from "../assets/SnapCart1.png";
import useScrollToElement from "../hooks/useScrollToElement";

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: { duration: 0.3 },
  },
};

const Registration = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();

  // Use custom hook for scrolling
  const { ref: registrationFormRef, scrollToElement } = useScrollToElement({
    behavior: "smooth",
    block: "center",
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const features = [
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      title: "Endless Selection",
      description:
        "Discover millions of products from trusted brands worldwide",
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Fast Delivery",
      description:
        "Get your products delivered to your doorstep in record time",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Shopping",
      description: "Shop with confidence with our buyer protection guarantee",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Best Deals",
      description:
        "Save big with exclusive discounts and flash sales every day",
    },
  ];

  // Products currently trending
  const trendingItems = [
    "Smart Watches",
    "Premium Headphones",
    "Eco Friendly Products",
    "Home Decor",
  ];

  const openLoginModal = () => {
    setIsLogin(true);
    setIsModalOpen(true);
    handleScrollToForm();
  };

  const openSignupModal = () => {
    setIsLogin(false);
    setIsModalOpen(true);
    handleScrollToForm();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Handle automatic scrolling to form on small to medium screens
  useEffect(() => {
    const shouldScrollToForm = location.state?.scrollToForm;

    if (shouldScrollToForm) {
      const isSmallToMedium = window.innerWidth < 768;

      if (isSmallToMedium) {
        // Use the custom hook's scroll function
        scrollToElement(500);
      }
    }
  }, [location.state, scrollToElement]);

  // Function to handle scroll to form when already on the page
  const handleScrollToForm = () => {
    // For mobile devices, we want to scroll on screens smaller than md (768px)
    const isSmallToMedium = window.innerWidth < 768;
    if (isSmallToMedium) {
      scrollToElement(100);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:px-10 overflow-hidden backdrop-blur-3xl">
      <AnimatePresence mode="wait">
        <motion.div
          key="registration"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-24 w-full max-w-7xl pt-24 mx-auto relative"
        >
          {/* Dynamic background elements */}
          <div className="absolute -z-10 top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-300 to-blue-300 dark:from-purple-800 dark:to-blue-800 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -z-10 bottom-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-pink-300 to-orange-300 dark:from-pink-800 dark:to-orange-800 rounded-full blur-3xl opacity-20"></div>

          {/* Left side content */}
          <div className="flex flex-col text-center lg:text-start gap-4 w-full relative">
            {/* Main text with improved typography */}
            <div className="text-3xl sm:text-4xl font-semibold">
              <h1>
                <span>Welcome to </span>
                <span>SnapCart</span>
              </h1>

              <div className="text-gradient1 dark:text-gradient text-2xl sm:text-3xl lg:text-4xl font-bold">
                Your Ultimate Shopping Destination!
              </div>

              {/* Animated promo section */}
              <p
                className={`text-slate-500 dark:text-white/70 text-lg sm:text-xl mt-4 transition-all duration-300 lg:max-w-xl`}
              >
                Start your shopping journey now and grab your favorites before
                they are gone! ✨
              </p>

              <h2 className="text-2xl sm:text-3xl mt-6 text-gradient1 dark:text-gradient">
                Discover. Shop. Enjoy.
              </h2>
            </div>

            {/* Trending now section */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl lg:max-w-xl px-10 py-5 mt-4 shadow-lg border border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2 text-lg font-semibold">
                <TrendingUp className="w-4 h-4" />
                <h3>Trending Now</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-100 dark:bg-purple-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors cursor-pointer"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Features showcase with improved styling */}
            <div className="py-6 lg:max-w-xl text-start">
              <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-xl shadow-lg p-8 transform transition-all duration-500 border border-purple-100 dark:border-purple-900/30">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 transition-all duration-500 ${
                      index === activeFeature
                        ? "opacity-100 transform scale-100"
                        : "opacity-0 absolute top-8 left-8 transform scale-95"
                    }`}
                  >
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-lg shadow-md">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl text-gray-800 dark:text-white font-semibold">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced dots indicator */}
              <div className="flex justify-center gap-2 mt-4">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`rounded-full transition-all flex items-center justify-center ${
                      index === activeFeature
                        ? "bg-gradient-to-r from-purple-600 to-blue-500 w-8 h-3 shadow-md"
                        : "bg-gray-300 dark:bg-gray-600 w-3 h-3 hover:bg-gray-400 dark:hover:bg-gray-500"
                    }`}
                    aria-label={`Feature ${index + 1}`}
                  >
                    {index === activeFeature && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Registration card */}
          <div ref={registrationFormRef} className="w-full max-w-lg relative">
            {/* Decorative elements */}
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-purple-200 dark:bg-purple-900 rounded-full blur-xl opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-blue-200 dark:bg-blue-900 rounded-full blur-xl opacity-60 animate-pulse"></div>

            {/* Main card with improved visual appeal */}
            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-xl px-4 py-12 sm:p-12 sm:mb-10 border border-purple-200 dark:border-purple-800/50 overflow-hidden z-10">
              {/* Logo and heading section */}
              <div className="flex flex-col items-center gap-4 sm:gap-6 mb-6 sm:mb-8 relative">
                <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600/10 to-blue-500/10 px-10 py-2 rounded-full">
                  <img
                    src={isDark ? SnapCartLogo : SnapCartLogo1}
                    alt="Logo"
                    className="w-8 h-8 rounded-full"
                  />
                  <h1 className="cursor-pointer font-extrabold text-2xl tracking-wider transition-all duration-300 ease-in-out hover:skew-x-6 hover:skew-y-3">
                    <span>SnapCart</span>
                    {/* <img src={isDark ? SnapCartLogo2 : SnapCartLogo3} alt='Logo' className='w-32 sm:w-40' /> */}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <h2 className="text-xl text-gradient1 dark:text-gradient font-semibold text-center">
                    Welcome to your shopping journey
                  </h2>
                </div>

                <p className="text-gray-500 dark:text-gray-300 text-center max-w-xs font-semibold sm:font-normal">
                  Join thousands of happy shoppers finding amazing deals every
                  day
                </p>
              </div>

              {/* Exclusive offer badge */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-3 mb-6 border border-purple-200 dark:border-purple-800/30">
                <div className="flex items-center gap-2 text-sm">
                  <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <span className=" text-purple-600 dark:text-purple-400">
                      Exclusive Offer:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {" "}
                      Get 20% off your first purchase!
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons with enhanced styling */}
              <div className="space-y-4">
                <button
                  onClick={openLoginModal}
                  className="flex items-center justify-center rounded-xl bg-gradient px-6 py-3 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30 w-full transform transition-all duration-300 hover:-translate-y-1"
                >
                  <span className="mr-2">Login to Your Account</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </button>

                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-gray-200 dark:border-gray-700 absolute w-full"></div>
                  <span className="bg-white dark:bg-slate-800 px-4 text-sm text-gray-500 dark:text-gray-400 relative">
                    or
                  </span>
                </div>

                <button
                  onClick={openSignupModal}
                  className="flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 px-6 py-3 text-gray-800 dark:text-white border-2 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-purple-100 dark:hover:shadow-purple-900/20 w-full transform transition-all duration-300 hover:-translate-y-1"
                >
                  Create New Account
                </button>
              </div>

              {/* Additional info with enhanced styling */}
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center mt-8">
                By signing up, you agree to our{" "}
                <a
                  href="#"
                  className="text-purple-600 dark:text-purple-400 hover:underline "
                >
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-purple-600 dark:text-purple-400 hover:underline "
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Authentication Modal */}
      <Register
        isModalOpen={isModalOpen}
        isLogin={isLogin}
        closeModal={closeModal}
        toggleForm={() => setIsLogin(!isLogin)}
      />
    </main>
  );
};

export default Registration;
