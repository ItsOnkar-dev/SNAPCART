import { useState, useEffect, useCallback } from "react";
import { Route, Routes } from 'react-router-dom';
import NavBar from "./Components/NavBar";
import Home from "./Pages/Home";
import LayOut from "./Components/LayOut";
import Products from "./Pages/Products";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Cart from "./Pages/Cart";
import Wishlist from "./Pages/Wishlist";
import Profile from "./Pages/Profile";
import Register from "./Pages/Register";

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
    <div className="min-h-screen bg-white text-gray-900 dark:bg-slate-900 dark:text-white transition-colors duration-300">
      <NavBar isDark={isDark} toggleDarkMode={toggleDarkMode} />
      <main> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Register initialMode="login"/>} />
          <Route path="/signup" element={<Register initialMode="signup" />} />
          <Route path="/layout" element={<LayOut />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;