import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SellerContext from "../context/Seller/SellerContext";

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { seller, errors: contextErrors } = useContext(SellerContext);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    storeName: "",
    storeDescription: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form if seller data exists
  useEffect(() => {
    if (seller) {
      setFormData({
        name: seller.name || "",
        email: seller.email || "",
        storeName: seller.storeName || "",
        storeDescription: seller.storeDescription || "",
        agreeToTerms: false, // Always require explicit agreement
      });
    }
  }, [seller]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Reset errors
    setErrors({});
    setIsSubmitting(true);

    // Basic validation
    const validationErrors = {};
    
    if (!formData.name.trim()) {
      validationErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      validationErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.storeName.trim()) {
      validationErrors.storeName = "Store name is required";
    }
    
    if (!formData.storeDescription.trim()) {
      validationErrors.storeDescription = "Store description is required";
    }
    
    if (!formData.agreeToTerms) {
      validationErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // Send the data to the backend - update if seller exists, create if not
    try {
      if (seller) {
        await axios.put(`http://localhost:8000/sellers/${seller.id}`, formData);
        console.log("Seller updated successfully");
      } else {
        await axios.post("http://localhost:8000/sellers", formData);
        console.log("Seller created successfully");
      }
      
      // Redirect to home page or a success page
      navigate("/home");
    } catch (error) {
      console.error("An error occurred:", error);

      // Display error to the user
      if (error.response) {
        setErrors({ submit: error.response.data.message || `Server error: ${error.response.status}` });
      } else if (error.request) {
        setErrors({ submit: "No response from server. Please check your connection and try again." });
      } else {
        setErrors({ submit: "An error occurred while submitting the form. Please try again." });
      }
      setIsSubmitting(false);
    }
  };

  const inputClasses = "shadow appearance-none border dark:border-gray-500 rounded w-full py-3 px-4 text-gray-700 dark:text-white/80 dark:bg-slate-800 leading-tight focus:outline-none focus:border-transparent transition-all duration-300";
  
  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="bg-white dark:bg-slate-900 border dark:border-gray-600 shadow-2xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 px-6 py-12 text-center border-b border-gray-300  dark:border-gray-500">
            <h1 className="text-4xl font-extrabold dark:text-white mb-3 tracking-tight">
              {seller ? 'Update Your Seller Profile' : 'Join Our Marketplace as a Seller'}
            </h1>
            <p className="dark:text-indigo-100 text-gray-500 text-lg max-w-2xl mx-auto">
              {seller 
                ? 'Update your information to keep your store details current and accurate.'
                : 'Start your journey as a seller and reach customers worldwide with your unique products.'}
            </p>
          </div>

          <div className="p-6 md:p-12">
            {/* Introduction Section - Only show for new sellers */}
            {!seller && (
              <section className="mb-12 bg-transparent">
                <h2 className="text-3xl font-bold mb-10 text-center text-indigo-500 dark:text-indigo-400">Why Sell With Us?</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-orange-300 p-6 rounded-lg shadow-md hover:shadow-lg transition-all ease-in-out duration-300  transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Wide Audience</h3>
                    <p className="text-gray-600 dark:text-slate-800">Connect with millions of potential customers searching for products like yours.</p>
                  </div>
                  
                  <div className="bg-indigo-300 p-6 rounded-lg shadow-md hover:shadow-lg transition-all ease-in-out duration-300  transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Setup</h3>
                    <p className="text-gray-600 dark:text-slate-800">Get your store up and running quickly with our streamlined onboarding process.</p>
                  </div>
                  
                  <div className="bg-pink-300 p-6 rounded-lg shadow-md hover:shadow-lg transition-all ease-in-out duration-300  transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Dedicated Support</h3>
                    <p className="text-gray-600 dark:text-slate-800">Our team is here to help you succeed with personalized assistance.</p>
                  </div>
                  
                  <div className="bg-rose-300 p-6 rounded-lg shadow-md hover:shadow-lg transition-all ease-in-out duration-300  transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Marketing Tools</h3>
                    <p className="text-gray-600 dark:text-slate-800">Powerful tools to promote your products and increase visibility.</p>
                  </div>
                  
                  <div className="bg-blue-300 p-6 rounded-lg shadow-md hover:shadow-lg transition-all ease-in-out duration-300  transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Payments</h3>
                    <p className="text-gray-600 dark:text-slate-800">Get paid quickly and securely with our trusted payment processing.</p>
                  </div>
                  
                  <div className="bg-purple-300 p-6 rounded-lg shadow-md hover:shadow-lg transition-all ease-in-out duration-300 transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Analytics</h3>
                    <p className="text-gray-600 dark:text-slate-800">Gain insights from detailed analytics to optimize your sales strategy.</p>
                  </div>
                </div>
              </section>
            )}

            {/* Show context errors if any */}
            {contextErrors && contextErrors.submit && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{contextErrors.submit}</p>
                </div>
              </div>
            )}

            {/* Application Form */}
            <section className="bg-transparent rounded-xl p-8 shadow-lg border border-gray-300 dark:border-gray-600 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white/80">
                {seller ? 'Update Your Store Information' : 'Start Selling Today'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 dark:text-white/80 text-sm font-bold mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${inputClasses} ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 dark:text-white/80 text-sm font-bold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${inputClasses} ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="storeName" className="block text-gray-700 dark:text-white/80 text-sm font-bold mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    id="storeName"
                    name="storeName"
                    placeholder="Your amazing store name"
                    value={formData.storeName}
                    onChange={handleChange}
                    className={`${inputClasses} ${errors.storeName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.storeName && <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>}
                </div>
                
                <div>
                  <label htmlFor="storeDescription" className="block text-gray-700 dark:text-white/80 text-sm font-bold mb-2">
                    Store Description
                  </label>
                  <textarea
                    id="storeDescription"
                    name="storeDescription"
                    placeholder="Tell us about your store, products, and what makes you unique..."
                    value={formData.storeDescription}
                    onChange={handleChange}
                    rows="5"
                    className={`${inputClasses} ${errors.storeDescription ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.storeDescription && <p className="text-red-500 text-sm mt-1">{errors.storeDescription}</p>}
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-500 dark:text-white/80  border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeToTerms" className="font-medium text-gray-700 dark:text-white/80">
                      I agree to the{" "}
                      <a href="/terms" className="text-indigo-500 dark:text-indigo-400 hover:text-blue-800 underline">
                        Terms and Conditions
                      </a>
                    </label>
                    {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>}
                  </div>
                </div>
                
                {/* Form submission errors */}
                {errors.submit && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                    <div className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>{errors.submit}</p>
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    seller ? 'Update Profile' : 'Become a Seller'
                  )}
                </button>
              </form>
            </section>
          </div>

          {/* Trust badges at the bottom */}
          {!seller && (
            <div className="bg-transparent border-t border-gray-300 dark:border-gray-500 py-8 px-6">
              <p className="text-center text-gray-600 dark:text-white/60 mb-4">Trusted by thousands of sellers worldwide</p>
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">4.9/5</div>
                  <div className="text-sm text-gray-500 dark:text-white/60 ">Seller satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">24/7</div>
                  <div className="text-sm text-gray-500 dark:text-white/60 ">Support available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">15M+</div>
                  <div className="text-sm text-gray-500 dark:text-white/60 ">Active buyers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">100%</div>
                  <div className="text-sm text-gray-500 dark:text-white/60 ">Secure transactions</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;