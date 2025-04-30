/* eslint-disable react/prop-types */
import { useState } from "react";
import CartContext from "./CartContext";
import { toast } from "react-toastify";

const CartContextProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]); 

  const addToCart = (item) => {
    setCart((prev) => [...prev, item]);
    toast.success(`${item.title} added to cart!`);
  };

  const removeFromCart = (title) => {
    setCart((prevCart) => prevCart.filter((item) => item.title !== title));
    toast.error(`${title} removed from cart!`);
  };

  const addToWishlist = (item) => {
    setWishlist((prev) => [...prev, item]); 
    toast.success(`${item.title} added to wishlist!`);
  };

  const removeFromWishlist = (title) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item.title !== title));
    toast.error(`${title} removed from wishlist!`);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        cartLength: cart.length, 
        addToCart, 
        removeFromCart, 
        wishlist, 
        wishlistLength: wishlist.length,  
        addToWishlist, 
        removeFromWishlist 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;