import { useState, useEffect, useCallback } from "react";
import { Route, Routes } from "react-router-dom";
import NavBar from "./Components/Navigation/NavBar";
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Cart from "./Pages/Cart";
import WishList from './Pages/WishList'
import Profile from "./Pages/Profile";
import Registration from "./Components/Registration";
import OAuthSuccess from "./Components/OAuthSuccess";
import Register from "./Pages/Register";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BecomeSeller from "./Pages/BecomeSeller";
import SellerContextProvider from "./context/Seller/SellerContextProvider";
import AdminDashboard from "./Pages/AdminDashboard";
import ProductManagement from "./Components/ProductList/ProductManagement";

// Get initial theme from localStorage or system preference
const getInitialTheme = () => {
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (storedTheme === "dark") {
    return true;
  } else if (storedTheme === "light") {
    return false;
  } else {
    return prefersDark;
  }
};

const App = () => {
  const [isDark, setIsDark] = useState(getInitialTheme);

  // Update theme in localStorage and document class
  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  return (
    <SellerContextProvider>
      <div className='min-h-screen bg-white text-gray-900 dark:bg-slate-900 dark:text-white transition-colors duration-300'>
        <NavBar isDark={isDark} toggleDarkMode={toggleDarkMode} />
        <main>
          <Routes>
          <Route path='/' element={<Home />} />
            <Route path='/registration' element={<Registration />} />
            <Route path='/login' element={<Register initialMode='login' />} />
            <Route path='/signup' element={<Register initialMode='signup' />} />
            <Route path='/oauth-success' element={<OAuthSuccess />} />
            <Route path='/products' element={<Products />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/wishlist' element={<WishList/>} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/become-seller' element={<BecomeSeller />} />
            <Route path='/admin' element={<AdminDashboard />} />
            <Route path='/seller/product-management' element={<ProductManagement />} />
          </Routes>
          <ToastContainer
            position='top-center'
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick={true}
            closeButton={true}
            draggable
            pauseOnFocusLoss
            pauseOnHover={false}
            theme='light'
            transition={Slide}
            toastClassName={() =>
              "relative min-h-16 flex items-center justify-between p-6 rounded-lg shadow-xl dark:bg-slate-900 dark:text-white bg-white text-slate-800 text-sm overflow-hidden cursor-pointer border border-gray-300 dark:border-gray-500"
            }
          />
        </main>
      </div>
    </SellerContextProvider>
  );
};

export default App;
