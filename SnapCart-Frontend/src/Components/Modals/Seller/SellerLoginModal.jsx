/* eslint-disable react/prop-types */
import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useSellerContext from "../../../context/Seller/useSellerContext"; // Adjust path if needed

const SellerLoginModal = ({ isOpen, onClose, switchToRegister }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Use the seller context
  const { loginSeller, errors: contextErrors } = useSellerContext();

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Email is invalid");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    setError("");
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Check if user is logged in first
      const token = localStorage.getItem("token");
      if (!token) {
        setError(
          "You must be logged in as a user first before accessing your seller account"
        );
        toast.error(
          "You must be logged in as a user first before accessing your seller account"
        );
        setIsSubmitting(false);
        return;
      }

      // Use the loginSeller function from context
      const sellerData = await loginSeller(formData);
      console.log(sellerData);
      navigate("/seller/dashboard");
      onClose();
    } catch (error) {
      console.error("Error logging in:", error);

      // Extract the most useful error message
      let errorMessage;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (contextErrors?.login) {
        errorMessage = contextErrors.login;
      } else {
        errorMessage =
          error.message || "No seller account found with this email";
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl px-8 py-14 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Login as a Seller
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Logging in..." : "Login as Seller"}
            </button>
          </div>

          {/* Register link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Don't have a seller account?{" "}
              <button
                type="button"
                onClick={switchToRegister}
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
              >
                Register
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerLoginModal;
