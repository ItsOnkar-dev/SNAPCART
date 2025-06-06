/* eslint-disable react/prop-types */
import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useSellerContext from "../../../context/Seller/useSellerContext";

const DeleteSellerModal = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteSeller } = useSellerContext();
  const navigate = useNavigate();

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteSeller();
      navigate("/"); // Navigate to home page after deletion
      onClose();
    } catch (error) {
      console.error("Error deleting seller account:", error);
      toast.error(error.message || "Failed to delete seller account");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Delete Seller Account
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete your seller account? This action
          cannot be undone. All your seller data, including products and sales
          history, will be permanently deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Deleting..." : "Delete Account"}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSellerModal;
