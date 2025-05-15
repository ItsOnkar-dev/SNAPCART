/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useUserContext from "../context/User/useUserContext";

const LogOutModal = ({ isOpen, onClose, onLogoutComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { logout } = useUserContext();
  const navigate = useNavigate();

  // Control visibility for smooth transitions
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle confirm logout
  const handleConfirmLogout = () => {
    setIsVisible(false);
    
    setTimeout(() => {

      logout();
      
      if (onClose) onClose();
      navigate("/");
      
      if (onLogoutComplete) onLogoutComplete();
    }, 300);
  };

  // Handle cancel logout
  const handleCancelLogout = () => {
    setIsVisible(false);
    
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-lg w-full px-10 py-8 transform transition-all duration-300 ease-in-out text-center relative ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 -translate-y-4'}`}>
        {/* Modal Header */}
        <h2 className='text-2xl mb-4 font-bold text-gray-800 dark:text-white'>Confirm Logout</h2>
        
        <button
          onClick={handleCancelLogout}
          className='text-white dark:text-slate-800 dark:hover:text-black transition-colors duration-200 bg-slate-700 dark:bg-white rounded-full p-1 absolute -top-2 -right-2'>
          <X size={20} />
        </button>
        
        {/* Modal Content */}
        <div className='flex items-center justify-center mb-6'>
          <div className='flex items-center gap-4'>
            <LogOut size={20} className="text-gray-700 dark:text-gray-300" />
            <p className='text-gray-700 dark:text-gray-300'>Are you sure you want to logout?</p>
          </div>
        </div>
        
        {/* Buttons */}
        <div className='flex justify-between gap-4'>
          <button 
            onClick={handleConfirmLogout} 
            className='w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200'>
            CONFIRM
          </button>
          <button
            onClick={handleCancelLogout}
            className='w-full bg-white hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 font-medium py-2 px-4 rounded border border-gray-300 dark:border-gray-600 transition-colors duration-200'>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogOutModal;