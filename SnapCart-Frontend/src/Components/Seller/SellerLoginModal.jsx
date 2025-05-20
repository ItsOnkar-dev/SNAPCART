/* eslint-disable react/prop-types */
import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useSellerContext from '../../context/Seller/useSellerContext'; // Adjust path if needed

const SellerLoginModal = ({ isOpen, onClose, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Use the seller context
  const { loginSeller, errors: contextErrors } = useSellerContext();

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Check if user is logged in first
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in as a user first before accessing your seller account');
        toast.error('You must be logged in as a user first before accessing your seller account');
        setIsSubmitting(false);
        return;
      }

      // Use the loginSeller function from context
      await loginSeller({ email });

      // If successful, navigate and close modal
      toast.success('Login successful!');
      navigate('/seller/product-management');
      onClose();
    } catch (error) {
      console.error('Error logging in:', error);

      // Extract the most useful error message
      let errorMessage;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (contextErrors?.login) {
        errorMessage = contextErrors.login;
      } else {
        errorMessage = error.message || 'No seller account found with this email';
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md px-10 py-16">
        {/* Header */}
        <div className="flex justify-between items-center border-b dark:border-gray-700 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white ">Seller Login</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Display context errors if any */}
            {contextErrors?.login && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
                {contextErrors.login}
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Email
              </label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-gray-600 ${error ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter your email"
              />
              {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              )}
            </div>
          </div>

          {/* For a real application, add password field here */}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          {/* Register link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Don&apos;t have a seller account?{' '}
              <button
                type="button"
                onClick={switchToRegister}
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
              >
                Register now
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerLoginModal;