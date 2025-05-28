/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SellerLoginModal from '../Components/Seller/SellerLoginModal';
import SellerRegisterModal from '../Components/Seller/SellerRegisterModal';
import SellerNavbar from '../Components/Navigation/SellerNavBar';
import SellerFooter from '../Components/Footer/SellerFooter'
import useUserContext from '../context/User/useUserContext';
import useSellerContext from '../context/Seller/useSellerContext';
import { toast } from 'react-toastify';

const BecomeSeller = ({ isDark, toggleDarkMode }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const { isLoggedIn } = useUserContext();
  const { seller, isSellerLoading, hasCheckedSellerStatus } = useSellerContext();
  const navigate = useNavigate();

  // Check if user is already a seller and redirect if needed
  useEffect(() => {
    const checkSellerStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      if (isLoggedIn && hasCheckedSellerStatus && !isSellerLoading) {
        if (seller) {
          console.log("User is already a seller, redirecting to product management");
          toast.info("You are already registered as a seller!");
          navigate('/seller/product-management');
        }
      }
    };

    checkSellerStatus();
  }, [isLoggedIn, hasCheckedSellerStatus, isSellerLoading, seller, navigate]);

  // Add a separate effect to handle initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && seller) {
      console.log("Initial load: User is a seller, redirecting to product management");
      navigate('/seller/product-management');
    }
  }, [seller, navigate]);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const switchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const switchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleStartSelling = () => {
    if (!isLoggedIn) {
      toast.warning("Please login first to become a seller");
      navigate("/registration");
      return;
    }
    openRegisterModal();
  };

  // Features data for the Why Sell With Us section
  const features = [
    {
      bg: "bg-orange-300",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      title: "Wide Audience",
      description: "Connect with millions of potential customers searching for products like yours.",
    },
    {
      bg: "bg-indigo-300",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      title: "Easy Setup",
      description: "Get your store up and running quickly with our streamlined onboarding process.",
    },
    {
      bg: "bg-pink-300",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      title: "Secure Payments",
      description: "Get paid quickly and securely with our trusted payment processing.",
    },
    {
      bg: "bg-rose-300",
      icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
      title: "Marketing Tools",
      description: "Powerful tools to promote your products and increase visibility.",
    },
    {
      bg: "bg-blue-300",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      title: "Seller Analytics",
      description: "Access detailed analytics to optimize your products and boost sales.",
    },
    {
      bg: "bg-purple-300",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      title: "Growth Insights",
      description: "Gain insights from detailed analytics to optimize your sales strategy.",
    },
  ];

  // Trust badges data
  const trustBadges = [
    { value: "4.9/5", label: "Seller satisfaction" },
    { value: "24/7", label: "Support available" },
    { value: "15M+", label: "Active buyers" },
    { value: "100%", label: "Secure transactions" },
  ];

  // Seller journey steps
  const sellerJourney = [
    {
      step: "1",
      title: "Create Account",
      description: "Register and set up your seller profile in minutes.",
      icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    },
    {
      step: "2",
      title: "List Products",
      description: "Upload products with images, descriptions, and pricing.",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    },
    {
      step: "3",
      title: "Receive Orders",
      description: "Get notified instantly when customers purchase your items.",
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    },
    {
      step: "4",
      title: "Ship & Grow",
      description: "Fulfill orders and watch your business expand.",
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    }
  ];

  return (
    <>
     <div className="min-h-screen pt-16 pb-20 bg-gray-50 dark:bg-slate-900">
      {/* Custom Navbar for Seller Page */}
      <SellerNavbar
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        openLoginModal={openLoginModal}
        openRegisterModal={handleStartSelling}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <NavLink to="/" className='flex items-center gap-1 max-w-fit text-white/70 hover:text-white'>
            <ArrowLeft size={16} />
            <h2>Back to Home</h2>
          </NavLink>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Grow Your Business </span>
            <span className="block text-gradient1">Sell with SnapCart</span>
          </h1>
          <p className="max-w-lg md:max-w-3xl mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg mt-5 md:text-xl">
            Join thousands of successful sellers and turn your passion into profit. Reach millions of customers and scale your business with our powerful selling tools.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={isLoggedIn ? openRegisterModal : () => {
                  toast.warning("Please login first to become a seller");
                  navigate("/registration");
                }}
                aria-label="Start selling"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient md:text-lg"
              >
                Start Selling Today
              </button>
            </div>
            <div className="ml-3 inline-flex">
              <button
                onClick={openLoginModal}
                aria-label="Login as Seller"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:text-lg"
              >
                Login as Seller
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 dark:text-white">Why Sell With Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all ease-in-out duration-300 transform hover:-translate-y-1 ${feature.bg} bg-opacity-20 dark:bg-opacity-10`}>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Seller Journey Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 dark:text-white">Your Seller Journey</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
            {sellerJourney.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mt-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                </svg>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-md py-10 px-6 mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-white">Trusted by Thousands of Sellers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustBadges.map((badge, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{badge.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{badge.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient rounded-lg shadow-xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
          <p className="mb-8 text-indigo-100 max-w-2xl mx-auto">
            Join our marketplace today and reach millions of potential customers. It only takes a few minutes to set up your seller account.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={isLoggedIn ? openRegisterModal : () => {
                toast.warning("Please login first to become a seller");
                navigate("/registration");
              }}
              className="px-8 py-3 bg-white text-indigo-700 rounded-md hover:bg-gray-100 font-medium"
            >
              Start Selling
            </button>
            <button
              onClick={openLoginModal}
              className="px-8 py-3 border border-white text-white rounded-md hover:bg-indigo-800 font-medium"
            >
              Login to Seller Account
            </button>
          </div>
        </section>
      </div>

      {/* Modals */}
      <SellerLoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        switchToRegister={switchToRegister}
      />

      <SellerRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        switchToLogin={switchToLogin}
      />
    </div>
    <SellerFooter />
    </>
  );
};

export default BecomeSeller;