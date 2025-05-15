/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Mail, Lock, User, Eye, EyeOff, Loader2, X } from "lucide-react";
import { FaGoogle, FaApple, FaShoppingBag } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import axios from "axios";
import { toast } from "react-toastify";
import useUserContext from "../context/User/useUserContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook

// Framer Motion variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 20,
    transition: { duration: 0.3 }
  }
};

// Form styles
const styles = {
  inputContainer: "flex items-center relative",
  inputField: "pl-10 w-full px-3 py-2 bg-gray-100 dark:bg-slate-900 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none",
  inputIcon: "absolute left-3 text-gray-400",
  labelText: "text-sm font-medium text-gray-700 dark:text-white block",
  formGroup: "space-y-2",
  radioButtons: "cursor-pointer relative px-4 py-1 rounded-lg border-2 text-center transition-all duration-300 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-600 dark:hover:border-gray-200 hover:border-gray-600",
  gradientButton: "w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-lg shadow-md hover:from-indigo-500 hover:to-purple-500 transition-colors flex items-center justify-center",
  socialButton: "flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
  socialButtonInner: "flex items-center justify-center gap-2",
  toggleLink: "dark:text-indigo-300 text-indigo-500 dark:hover:text-indigo-400",
  headerGradient: "relative bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white",
  cardContainer: "rounded-xl shadow-xl overflow-hidden border border-gray-300 dark:border-slate-600",
  formContainer: "p-6 space-y-4 bg-white dark:bg-slate-900 dark:text-white",
};

const Register = ({ isModalOpen, isLogin, closeModal, toggleForm }) => {
  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Buyer");
  const modalRef = useRef(null);
  const { login } = useUserContext();
  const navigate = useNavigate(); // Initialize navigate hook

  // Add effect to scroll the modal into view when it opens
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      // Small delay to ensure the modal is rendered before scrolling
      setTimeout(() => {
        modalRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [isModalOpen]);

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:8000/auth/google';
  };

  const validateForm = () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!isLogin && !name.trim()) {
      toast.error("Name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      let userData;
      if (isLogin) {
        userData = {
          username: name,
          password: password,
          role: role || "Buyer", // Default to buyer if no role is specified during login
        };
        // Use context login function
        login(userData);
      } else {
        if (!role) {
          toast.error("Please select a role (Seller or Buyer)");
          setIsLoading(false);
          return;
        }
        userData = {
          username: name,
          email: email,
          password: password,
          role: role,
        };
      }

      console.log(isLogin ? "Logging in with:" : "Signing up with:", userData);

      const response = await axios.post(`http://localhost:8000/auth/${isLogin ? "login" : "register"}`, userData);
      if (response.status === "success") {
        toast.success(response.data?.message || "Logged In successful");
      } else {
        toast.success(response.data?.message || "Account Created Successfully")
        closeModal()
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.response?.data || "An error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 md:mt-24"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          onClick={closeModal}
        >
          <motion.div 
            ref={modalRef}
            className="w-full max-w-lg"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.cardContainer}>
              {/* Header */}
              <div className={styles.headerGradient}>
                <button className="inline-flex items-center gap-1 text-sm mb-4" onClick={closeModal}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <h2 className="text-2xl font-bold">{isLogin ? "Welcome Back" : "Create Account"}</h2>
                <p className="text-purple-100">{isLogin ? "Sign in to access your account" : "Sign up to get started with our service"}</p>

                <div className="cursor-pointer absolute top-6 right-5" onClick={closeModal}>
                 <X/>
               </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className={styles.formContainer}>
                {/* Name field (only for signup) */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      className={styles.formGroup}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}>
                      <label htmlFor="name" className={styles.labelText}>
                        Username
                      </label>
                      <div className={styles.inputContainer}>
                        <div className={styles.inputIcon}>
                          <User size={18} />
                        </div>
                        <input id="name" type="text" name="username" value={name} placeholder="John Doe" required={!isLogin} onChange={(e) => setName(e.target.value)} className={styles.inputField} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Username/Email field */}
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.labelText}>
                    {isLogin ? "Username" : "Email Address"}
                  </label>
                  <div className={styles.inputContainer}>
                    {isLogin ? (
                      <div className={styles.inputIcon}>
                        <User size={18} />
                      </div>
                    ) : (
                      <div className={styles.inputIcon}>
                        <Mail size={18} />
                      </div>
                    )}
                    {isLogin ? (
                      <input id="name" type="text" name="username" value={name} placeholder="John Doe" required onChange={(e) => setName(e.target.value)} className={styles.inputField} />
                    ) : (
                      <input
                        id="email"
                        type="text"
                        name="email"
                        value={email}
                        placeholder="your@gmail.com"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.inputField}
                      />
                    )}
                  </div>
                </div>

                {/* Password field */}
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.labelText}>
                    Password
                  </label>
                  <div className={styles.inputContainer}>
                    <div className={styles.inputIcon}>
                      <Lock size={18} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      placeholder="••••••••"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.inputField}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Role selection (only for signup) */}
                {!isLogin && (
                  <div className="flex items-center gap-6 py-2">
                    <label
                      className={`${styles.radioButtons} ${role === "Seller" ? "text-purple-800 dark:text-purple-200 border-purple-500 dark:border-purple-500" : ""}`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="Seller" 
                        checked={role === "Seller"} 
                        onChange={(e) => setRole(e.target.value)} 
                        className="hidden" 
                      />
                      <div className="flex gap-2 items-center">
                        <FaSackDollar/>
                        <span>Seller</span>
                      </div>
                    </label>

                    <label
                      className={`${styles.radioButtons} ${role === "Buyer" ? "text-indigo-700 dark:text-indigo-200 border-indigo-500 dark:border-indigo-500" : ""}`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="Buyer" 
                        checked={role === "Buyer"} 
                        onChange={(e) => setRole(e.target.value)} 
                        className="hidden" 
                      />
                      <div className="flex gap-2 items-center">
                        <FaShoppingBag/>
                        <span>Buyer</span>
                      </div>
                    </label>
                  </div>
                )}

                {/* Forgot password (login only) */}
                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <label htmlFor="remember" className="text-sm font-normal text-gray-700 dark:text-slate-400">
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="text-sm text-indigo-500 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      Forgot your password?
                    </a>
                  </div>
                )}

                {/* Submit button */}
                <button type="submit" className={styles.gradientButton} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLogin ? "Signing In..." : "Creating an account..."}
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="ml-2" size={18} />
                    </>
                  )}
                </button>

                {/* Toggle between login/signup */}
                <div className="text-center mt-6">
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button type="button" onClick={toggleForm} className={styles.toggleLink}>
                      {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                  </div>
                </div>

                {/* Social login options */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">Or continue with</div>
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      className={styles.socialButton}
                      onClick={handleGoogleSignIn}>
                      <div className={styles.socialButtonInner}>
                        <FaGoogle />
                        Sign In With Google
                      </div>
                    </button>
                    <button
                      type="button"
                      className={styles.socialButton}>
                      <div className={styles.socialButtonInner}>
                        <FaApple />
                        Sign In With Apple
                      </div>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Register;