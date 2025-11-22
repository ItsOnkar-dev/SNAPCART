/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartContext from "./CartContext";

const CartContextProvider = ({ children }) => {
  // Load cart from localStorage on mount
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("snapcart_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem("snapcart_wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("snapcart_cart", JSON.stringify(cart));
  }, [cart]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("snapcart_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      // Check if item already exists in cart (by _id or title)
      const existingItemIndex = prev.findIndex(
        (cartItem) => cartItem._id === item._id || cartItem.title === item.title
      );

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedCart = [...prev];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          qty: (updatedCart[existingItemIndex].qty || 1) + (item.qty || 1),
        };
        toast.success(`${item.title} quantity updated in cart!`);
        return updatedCart;
      } else {
        // New item, add to cart
        toast.success(`${item.title} added to cart!`);
        return [...prev, { ...item, qty: item.qty || 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((itemIdOrTitle, silent = false) => {
    setCart((prevCart) => {
      const item = prevCart.find(
        (cartItem) =>
          cartItem._id === itemIdOrTitle || cartItem.title === itemIdOrTitle
      );
      if (item && !silent) {
        toast.error(`${item.title} removed from cart!`);
      }
      return prevCart.filter(
        (item) => item._id !== itemIdOrTitle && item.title !== itemIdOrTitle
      );
    });
  }, []);

  const updateQuantity = useCallback(
    (itemIdOrTitle, newQuantity) => {
      if (newQuantity <= 0) {
        removeFromCart(itemIdOrTitle);
        return;
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item._id === itemIdOrTitle || item.title === itemIdOrTitle
            ? { ...item, qty: newQuantity }
            : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    toast.info("Cart cleared!");
  }, []);

  // Calculate cart totals
  const cartTotal = cart.reduce((total, item) => {
    return total + (item.price || 0) * (item.qty || 1);
  }, 0);

  const cartItemsCount = cart.reduce((count, item) => {
    return count + (item.qty || 1);
  }, 0);

  const addToWishlist = useCallback((item) => {
    setWishlist((prev) => {
      // Check if already in wishlist
      const exists = prev.some(
        (wishItem) => wishItem._id === item._id || wishItem.title === item.title
      );
      if (exists) {
        toast.info(`${item.title} is already in your wishlist!`);
        return prev;
      }
      toast.success(`${item.title} added to wishlist!`);
      return [...prev, item];
    });
  }, []);

  const removeFromWishlist = useCallback((itemIdOrTitle) => {
    setWishlist((prevWishlist) => {
      const item = prevWishlist.find(
        (wishItem) =>
          wishItem._id === itemIdOrTitle || wishItem.title === itemIdOrTitle
      );
      if (item) {
        toast.error(`${item.title} removed from wishlist!`);
      }
      return prevWishlist.filter(
        (item) => item._id !== itemIdOrTitle && item.title !== itemIdOrTitle
      );
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLength: cart.length,
        cartItemsCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        wishlist,
        wishlistLength: wishlist.length,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;
