import { useState, useEffect, useCallback } from "react";
import { Route, Routes } from "react-router-dom";
import NavBar from "./Components/NavBar";
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Cart from "./Pages/Cart";
import Wishlist from "./Pages/Wishlist";
import Profile from "./Pages/Profile";
import Registration from "./Components/Registration";
import Register from "./Pages/Register";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {

  // Get initial theme from localStorage or system preference
  const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  const [isDark, setIsDark] = useState(getInitialTheme);

  // Update theme in localStorage and document class
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);


  return (
    <div className='min-h-screen bg-white text-gray-900 dark:bg-slate-900 dark:text-white transition-colors duration-300'>
      <NavBar isDark={isDark} toggleDarkMode={toggleDarkMode} />
      <main>
        <Routes>
          <Route path='/' element={<Registration />} />
          <Route path='/login' element={<Register initialMode='login' />} />
          <Route path='/signup' element={<Register initialMode='signup' />} />
          <Route path='/home' element={<Home />} />
          <Route path='/products' element={<Products />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/wishlist' element={<Wishlist />} />
          <Route path='/profile' element={<Profile />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick={true}
          closeButton={true}
          draggable
          pauseOnFocusLoss
          pauseOnHover={false}
          theme="light"
          transition={Slide}
          toastClassName={() =>
            "relative min-h-16 flex items-center justify-between p-6 rounded-lg shadow-xl dark:bg-slate-900 dark:text-white bg-white text-slate-800 text-sm overflow-hidden cursor-pointer border border-gray-300 dark:border-gray-500"
          }
          bodyClassName={() => "flex-1"}
          progressClassName={() =>
            "Toastify__progress-bar Toastify__progress-bar--animated Toastify__progress-bar--default h-1 bg-gradient-to-r from-indigo-600 via-cyan-400 to-purple-600"
          }
        />
      </main>
    </div>
  );
};

export default App;
