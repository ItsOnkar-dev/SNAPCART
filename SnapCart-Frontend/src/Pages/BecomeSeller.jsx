/* eslint-disable react/prop-types */
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SellerContext from "../context/Seller/SellerContext";
import UserContext from "../context/User/UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { seller, isSellerLoading, createSeller, errors: contextErrors } = useContext(SellerContext);
  const { user } = useContext(UserContext);

  // Create refs for each input field
  const inputRefs = {
    name: useRef(null),
    email: useRef(null),
    storeName: useRef(null),
    storeDescription: useRef(null),
  };

  // Track the active input field
  const [activeField, setActiveField] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    storeName: "",
    storeDescription: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If seller data exists, redirect to product management
  useEffect(() => {
    if (!isSellerLoading && seller) {
      toast.info("You are already a seller! Redirecting to product management...");
      // Add a small delay to allow the toast to be seen
      setTimeout(() => {
        navigate("/seller/product-management");
      }, 1500);
    }
  }, [seller, navigate, isSellerLoading]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user && user.email) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Restore focus after render if we have an active field
  useEffect(() => {
    if (activeField && inputRefs[activeField] && inputRefs[activeField].current) {
      const input = inputRefs[activeField].current;
      const length = input.value.length;

      // Set timeout to ensure this happens after React's updates
      setTimeout(() => {
        input.focus();

        // For text inputs, place cursor at the end
        if (input.type !== "checkbox") {
          input.setSelectionRange(length, length);
        }
      }, 0);
    }
  }, [formData, errors, activeField]);

  const handleFocus = (fieldName) => {
    setActiveField(fieldName);
  };

  const handleBlur = () => {
    // Only clear active field if we're not immediately focusing another of our inputs
    setTimeout(() => {
      setActiveField(null);
    }, 100);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    // Remember which field we're editing
    setActiveField(name);

    // Update form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear any errors for this field
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.name.trim()) validationErrors.name = "Name is required";

    if (!formData.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      validationErrors.email = "Please enter a valid email address";
    }

    if (!formData.storeName.trim()) validationErrors.storeName = "Store name is required";
    if (!formData.storeDescription.trim()) validationErrors.storeDescription = "Store description is required";
    if (!formData.agreeToTerms) validationErrors.agreeToTerms = "You must agree to the terms and conditions";

    return validationErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Reset errors
    setErrors({});
    setIsSubmitting(true);

    // Client-side validation
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Submitting seller form with data:", formData);
      // Use the createSeller function from context
      await createSeller(formData);
      // Navigate to product management on success
      navigate("/seller/product-management");
      toast.success("Seller application submitted successfully! Redirecting to product management...");
    } catch (error) {
      console.error("An error occurred:", error);
      let errorMessage;

      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection and try again.";
      } else {
        errorMessage = error.message || "An error occurred while submitting the form. Please try again.";
      }

      setErrors({ submit: errorMessage });
      setIsSubmitting(false);
    }
  };

  const styles = {
    input:
      "shadow appearance-none border dark:border-gray-500 rounded w-full py-3 px-4 text-gray-700 dark:text-white/80 dark:bg-slate-800 leading-tight focus:outline-none focus:border-transparent transition-all duration-300",
    featureCard: "p-6 rounded-lg shadow-md hover:shadow-lg transition-all ease-in-out duration-300 transform hover:-translate-y-1",
    formLabel: "block text-gray-700 dark:text-white/80 text-sm font-bold mb-2",
    errorText: "text-red-500 text-sm mt-1",
    submitButton:
      "w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
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
      title: "Secure Payments",
      description: "Get paid quickly and securely with our trusted payment processing.",
    },
    {
      bg: "bg-purple-300",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      title: "Analytics",
      description: "Gain insights from detailed analytics to optimize your sales strategy.",
    },
  ];

  // Show loading while checking seller status
  if (isSellerLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500'></div>
      </div>
    );
  }

  // Trust badges data
  const trustBadges = [
    { value: "4.9/5", label: "Seller satisfaction" },
    { value: "24/7", label: "Support available" },
    { value: "15M+", label: "Active buyers" },
    { value: "100%", label: "Secure transactions" },
  ];

  // Reusable form input component using refs to maintain focus
  const FormInput = ({ id, label, type = "text", placeholder, value, error }) => (
    <div>
      <label htmlFor={id} className={styles.formLabel}>
        {label}
      </label>
      <input
        ref={inputRefs[id]}
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={() => handleFocus(id)}
        onBlur={handleBlur}
        className={`${styles.input} ${error ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-gray-300"}`}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );

  // Error component for displaying submission errors
  const ErrorAlert = ({ message }) => (
    <div className='p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded mb-4'>
      <div className='flex'>
        <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-red-500 mr-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
        <p>{message}</p>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen py-24'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl'>
        <div className='bg-white dark:bg-slate-900 border dark:border-gray-600 shadow-lg rounded-lg overflow-hidden'>
          {/* Header */}
          <div className='bg-white dark:bg-slate-900 px-6 py-8 text-center border-b border-gray-300 dark:border-gray-600'>
            <h1 className='text-3xl font-extrabold dark:text-white mb-3'>Become a Seller</h1>
            <p className='dark:text-indigo-100 text-gray-500 text-lg max-w-2xl mx-auto'>
              Start selling your products and reach customers worldwide with your unique products. Expand your reach and grow your business by becoming a seller on SnapCart. We offer you a platform to
              connect with millions of customers eager to discover unique products like yours.
            </p>
          </div>

          <div className='p-6'>
            {/* Features - Simplified */}
            <section className='mb-8'>
              <h2 className='text-2xl font-bold mb-6 text-center text-indigo-500 dark:text-indigo-400'>Why Sell With Us?</h2>
              <div className='grid md:grid-cols-3 gap-6'>
                {features.map((feature, index) => (
                  <div key={index} className={`${styles.featureCard} ${feature.bg}`}>
                    <div className='w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-4'>
                      <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-indigo-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={feature.icon} />
                      </svg>
                    </div>
                    <h3 className='text-lg font-semibold mb-2 text-black'>{feature.title}</h3>
                    <p className='text-sm text-slate-700'>{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Show context or form errors if any */}
            {contextErrors && contextErrors.submit && <ErrorAlert message={contextErrors.submit} />}
            {errors.submit && <ErrorAlert message={errors.submit} />}

            {/* Application Form */}
            <section className='bg-transparent rounded-lg p-6 border border-gray-300 dark:border-gray-600'>
              <h2 className='text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white/80'>Create Your Seller Account</h2>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <FormInput id='name' label='Your Name' placeholder='Enter your full name' value={formData.name} error={errors.name} />
                <FormInput id='email' label='Email Address' type='email' placeholder='your@email.com' value={formData.email} error={errors.email} />
                <FormInput id='storeName' label='Store Name' placeholder='Your store name' value={formData.storeName} error={errors.storeName} />

                <div>
                  <label htmlFor='storeDescription' className={styles.formLabel}>
                    Store Description
                  </label>
                  <textarea
                    ref={inputRefs.storeDescription}
                    id='storeDescription'
                    name='storeDescription'
                    placeholder='Tell us about your store and products...'
                    value={formData.storeDescription}
                    onChange={handleChange}
                    onFocus={() => handleFocus("storeDescription")}
                    onBlur={handleBlur}
                    rows='4'
                    className={`${styles.input} ${errors.storeDescription ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-gray-300"}`}
                  />
                  {errors.storeDescription && <p className={styles.errorText}>{errors.storeDescription}</p>}
                </div>

                <div className='flex items-start'>
                  <div className='flex items-center h-5'>
                    <input
                      type='checkbox'
                      id='agreeToTerms'
                      name='agreeToTerms'
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      onFocus={() => handleFocus("agreeToTerms")}
                      onBlur={handleBlur}
                      className='w-4 h-4 text-indigo-500 dark:text-white/80 border-gray-300 rounded focus:ring-blue-500'
                    />
                  </div>
                  <div className='ml-3 text-sm'>
                    <label htmlFor='agreeToTerms' className='font-medium text-gray-700 dark:text-white/80'>
                      I agree to the{" "}
                      <a href='/terms' className='text-indigo-500 dark:text-indigo-400 hover:text-blue-800 underline'>
                        Terms and Conditions
                      </a>
                    </label>
                    {errors.agreeToTerms && <p className={styles.errorText}>{errors.agreeToTerms}</p>}
                  </div>
                </div>

                <button type='submit' disabled={isSubmitting} className={`${styles.submitButton} ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}>
                  {isSubmitting ? (
                    <>
                      <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Become a Seller"
                  )}
                </button>
              </form>
            </section>
          </div>
          {/* Trust badges at the bottom */}
          {!seller && (
            <div className='bg-transparent border-t border-gray-300 dark:border-gray-600 py-8 px-6'>
              <p className='text-center text-gray-600 dark:text-white/60 mb-4'>Trusted by thousands of sellers worldwide</p>
              <div className='flex justify-center space-x-8'>
                {trustBadges.map((badge, index) => (
                  <div key={index} className='text-center'>
                    <div className='text-2xl font-bold text-indigo-500 dark:text-indigo-400'>{badge.value}</div>
                    <div className='text-sm text-gray-500 dark:text-white/60'>{badge.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;
