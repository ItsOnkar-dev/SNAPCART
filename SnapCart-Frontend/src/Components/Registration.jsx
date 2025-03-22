import { NavLink } from "react-router-dom";
import { ShoppingCart, Sparkles } from "lucide-react";

const Registration = () => {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-950 dark:to-blue-950 overflow-x-hidden">
      <div className="w-full max-w-md relative">
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-purple-200 dark:bg-purple-900 rounded-full blur-xl opacity-60"></div>
        <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-blue-200 dark:bg-blue-900 rounded-full blur-xl opacity-60"></div>
        
        {/* Main card */}
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 overflow-hidden z-10">
          {/* Logo and heading section */}
          <div className="flex flex-col items-center space-y-6 mb-8">
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              <h1 className="cursor-pointer font-extrabold text-2xl sm:text-4xl tracking-widest transition-all duration-300 ease-in-out hover:skew-x-6 hover:skew-y-3">
                <span className="text-gradient">Snap</span>
                <span className="text-gray-800 dark:text-white">Cart</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <h2 className="text-xl font-medium text-gray-800 dark:text-white">Welcome to your shopping journey</h2>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
            
            <p className="text-gray-500 dark:text-gray-300 text-center max-w-xs">
              Join thousands of happy shoppers finding amazing deals every day
            </p>
          </div>
          
          {/* Action buttons with enhanced styling */}
          <div className="space-y-4">
            <NavLink
              to="/login"
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 px-6 py-3 text-white font-medium shadow-lg shadow-purple-200 dark:shadow-purple-900/30 w-full transform transition-all duration-300 hover:-translate-y-1"
            >
              Login to Your Account
            </NavLink>
            
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-200 dark:border-gray-700 absolute w-full"></div>
              <span className="bg-white dark:bg-slate-800 px-4 text-sm text-gray-500 dark:text-gray-400 relative">
                or
              </span>
            </div>
            
            <NavLink
              to="/signup"
              className="flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 px-6 py-3 text-gray-800 dark:text-white font-medium border-2 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-purple-100 dark:hover:shadow-purple-900/20 w-full transform transition-all duration-300 hover:-translate-y-1"
            >
              Create New Account
            </NavLink>
          </div>
          
          {/* Additional info */}
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mt-8">
            By signing up, you agree to our <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">Terms</a> and <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Registration;