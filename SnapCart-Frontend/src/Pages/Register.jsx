/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { FaGoogle, FaApple } from "react-icons/fa";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

const styles = {
  inputContainer: "flex items-center relative",
  inputField: "pl-10 w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none transition-all",
  inputIcon: "absolute left-3 text-gray-400",
  labelText: "text-sm font-medium text-gray-700 dark:text-white block",
  formGroup: "space-y-2",
  gradientButton:
    "w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-lg shadow-md hover:from-indigo-500 hover:to-purple-500 transition-colors flex items-center justify-center",
  socialButton:
    "flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
  socialButtonInner: "flex items-center justify-center gap-2",
  toggleLink: "dark:text-indigo-300 text-indigo-500 dark:hover:text-indigo-400",
  headerGradient: "bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white",
  cardContainer: "rounded-xl shadow-xl overflow-hidden dark:border border-slate-600",
  formContainer: "p-6 space-y-4 bg-white dark:bg-slate-900 dark:text-white",
};

const Register = ({ initialMode = "login" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [isLogin, setIsLogin] = useState(
    location.pathname === "/login" || initialMode === "login"
  );

  useEffect(() => {
    if (location.pathname === '/login') {
      setIsLogin(true);
    } else if (location.pathname === '/signup') {
      setIsLogin(false);
    }
  }, [location.pathname]);

  const toggleForm = useCallback(() => {
    setIsLogin(prevIsLogin => !prevIsLogin);
    navigate(isLogin ? "/signup" : "/login");
  }, [isLogin, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newUser = {
      email: email,
      password: password,
      ...(isLogin ? {} : { username: name }),
    };

    // Simulate API call
    setTimeout(() => {
      console.log(isLogin ? "Logging in with:" : "Signing up with:", newUser);
      toast.success(isLogin ? "Login successful! Welcome back!" : "Sign Up successful! Please login to get started..");
      setIsLoading(false);

      setTimeout(() => {
        if (isLogin) {
          navigate("/layout");
        } else {
          setIsLogin(true);
          navigate("/login");
        }
      }, 1000);
    }, 2000);
  };

  return (
    <>
      <motion.div variants={containerVariants} initial='hidden' animate='visible' exit='exit' className='min-h-screen flex items-center justify-center p-4'>
        <div className='w-full max-w-md relative'>
          {/* Main card */}
          <AnimatePresence mode='wait'>
            <motion.div key={isLogin ? "login" : "signup"} className={styles.cardContainer} variants={containerVariants} initial='hidden' animate='visible' exit='exit'>
              {/* Header */}
              <motion.div className={styles.headerGradient} variants={itemVariants}>
                <NavLink to='/' className='inline-flex items-center gap-1 text-sm mb-4'>
                  <ArrowLeft className='h-4 w-4' />
                  Back
                </NavLink>
                <h2 className='text-2xl font-bold'>{isLogin ? "Welcome Back" : "Create Account"}</h2>
                <p className='text-purple-100'>{isLogin ? "Sign in to access your account" : "Sign up to get started with our service"}</p>
              </motion.div>

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
                      <label htmlFor='name' className={styles.labelText}>
                        Full Name
                      </label>
                      <div className={styles.inputContainer}>
                        <div className={styles.inputIcon}>
                          <User size={18} />
                        </div>
                        <input id='name' type='text' name='username' value={name} placeholder='John Doe' required={!isLogin} onChange={(e) => setName(e.target.value)} className={styles.inputField} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email field */}
                <motion.div className={styles.formGroup} variants={itemVariants}>
                  <label htmlFor='email' className={styles.labelText}>
                    Email Address
                  </label>
                  <div className={styles.inputContainer}>
                    <div className={styles.inputIcon}>
                      <Mail size={18} />
                    </div>
                    <input id='email' type='email' name='email' value={email} placeholder='your@gmail.com' required onChange={(e) => setEmail(e.target.value)} className={styles.inputField} />
                  </div>
                </motion.div>

                {/* Password field */}
                <motion.div className={styles.formGroup} variants={itemVariants}>
                  <label htmlFor='password' className={styles.labelText}>
                    Password
                  </label>
                  <div className={styles.inputContainer}>
                    <div className={styles.inputIcon}>
                      <Lock size={18} />
                    </div>
                    <input
                      id='password'
                      type={showPassword ? "text" : "password"}
                      name='password'
                      value={password}
                      placeholder='••••••••'
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.inputField}
                    />
                    <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-3 text-gray-400 hover:text-gray-600'>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>

                {/* Forgot password (login only) */}
                <AnimatePresence>
                  {isLogin && (
                    <motion.div
                      className='flex items-center justify-between'
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}>
                      <div className='flex items-center space-x-2'>
                        <input type='checkbox' id='remember' className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500' />
                        <label htmlFor='remember' className='text-sm font-normal text-gray-700 dark:text-slate-400'>
                          Remember me
                        </label>
                      </div>
                      <a href='#' className='text-sm text-indigo-500 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors'>
                        Forgot your password?
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button type='submit' className={styles.gradientButton} variants={itemVariants} whileTap={{ scale: 0.98 }} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {isLogin ? "Signing In..." : "Creating an account..."}
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className='ml-2' size={18} />
                    </>
                  )}
                </motion.button>

                {/* Toggle between login/signup */}
                <motion.div className='text-center mt-6' variants={itemVariants}>
                  <div className='text-gray-600 dark:text-gray-400 text-sm'>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <motion.button type='button' onClick={toggleForm} className={styles.toggleLink} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      {isLogin ? "Sign Up" : "Sign In"}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Social login options */}
                <motion.div className='mt-6 pt-6 border-t border-gray-200' variants={itemVariants}>
                  <div className='text-center text-sm text-gray-500 dark:text-gray-400 mb-4'>Or continue with</div>
                  <div className='flex items-center justify-center space-x-2'>
                    <motion.button
                      type='button'
                      className={styles.socialButton}
                      whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                      whileTap={{ y: 0, boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)" }}>
                      <div className={styles.socialButtonInner}>
                        <FaGoogle />
                        Google
                      </div>
                    </motion.button>
                    <motion.button
                      type='button'
                      className={styles.socialButton}
                      whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                      whileTap={{ y: 0, boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)" }}>
                      <div className={styles.socialButtonInner}>
                        <FaApple />
                        Apple
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        draggable
        theme="light"
        transition={Slide}
        toastClassName={() => "relative min-h-16 flex items-center justify-between p-6 rounded-lg shadow-xl dark:bg-slate-900 dark:text-white bg-white text-slate-800 text-sm overflow-hidden cursor-pointer border border-gray-300 dark:border-gray-500"}
        bodyClassName={() => "flex-1"}
        progressClassName={() => 
          "Toastify__progress-bar Toastify__progress-bar--animated Toastify__progress-bar--default h-1 bg-gradient-to-r from-cyan-500 via-rose-500 to-purple-500"
        }
      />
    </>
  );
};

export default Register;
