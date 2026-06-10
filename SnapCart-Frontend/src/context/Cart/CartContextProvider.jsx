/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartContext from "./CartContext";
import axiosInstance from "../../config/axios";
import useUserContext from "../User/useUserContext";

const CartContextProvider = ({ children }) => {
  const { isLoggedIn } = useUserContext();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem("snapcart_wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("snapcart_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Fetch Cart from Backend if logged in, otherwise load from localStorage
  const fetchCart = useCallback(async () => {
    if (isLoggedIn) {
      try {
        const response = await axiosInstance.get("/api/cart");
        if (response.data?.data) {
          // Normalize the backend cart items: items: [{ productId: {...}, qty }] -> [{ ...product, qty }]
          const normalizedItems = response.data.data.items
            .filter(item => item.productId !== null)
            .map(item => ({
              ...item.productId,
              qty: item.qty
            }));
          setCart(normalizedItems);
        }
      } catch (error) {
        console.error("Error fetching cart from server:", error);
      }
    } else {
      const savedCart = localStorage.getItem("snapcart_cart");
      setCart(savedCart ? JSON.parse(savedCart) : []);
    }
  }, [isLoggedIn]);

  // Sync guest cart with backend on login
  useEffect(() => {
    const syncGuestCart = async () => {
      if (isLoggedIn) {
        const savedCart = localStorage.getItem("snapcart_cart");
        const guestItems = savedCart ? JSON.parse(savedCart) : [];

        if (guestItems.length > 0) {
          try {
            console.log("Merging guest cart with database cart");
            const syncPayload = guestItems.map(item => ({
              productId: item._id,
              qty: item.qty
            }));
            const response = await axiosInstance.post("/api/cart/sync", { guestCart: syncPayload });
            if (response.data?.data) {
              const normalizedItems = response.data.data.items
                .filter(item => item.productId !== null)
                .map(item => ({
                  ...item.productId,
                  qty: item.qty
                }));
              setCart(normalizedItems);
              localStorage.removeItem("snapcart_cart");
              toast.success("Merged guest cart with your account! 🛒");
            }
          } catch (error) {
            console.error("Failed to sync guest cart:", error);
            fetchCart();
          }
        } else {
          fetchCart();
        }
      } else {
        const savedCart = localStorage.getItem("snapcart_cart");
        setCart(savedCart ? JSON.parse(savedCart) : []);
      }
    };

    syncGuestCart();
  }, [isLoggedIn, fetchCart]);

  // Save cart to localStorage only if NOT logged in
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem("snapcart_cart", JSON.stringify(cart));
    }
  }, [cart, isLoggedIn]);

  const addToCart = useCallback(async (item) => {
    if (isLoggedIn) {
      try {
        const response = await axiosInstance.post("/api/cart/add", {
          productId: item._id,
          qty: item.qty || 1
        });
        if (response.data?.data) {
          const normalizedItems = response.data.data.items
            .filter(i => i.productId !== null)
            .map(i => ({
              ...i.productId,
              qty: i.qty
            }));
          setCart(normalizedItems);
          toast.success(`${item.title} added to cart!`);
        }
      } catch (error) {
        console.error("Error adding item to backend cart:", error);
        toast.error("Failed to add item to cart");
      }
    } else {
      setCart((prev) => {
        const existingItemIndex = prev.findIndex(
          (cartItem) => cartItem._id === item._id || cartItem.title === item.title
        );

        if (existingItemIndex >= 0) {
          const updatedCart = [...prev];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            qty: (updatedCart[existingItemIndex].qty || 1) + (item.qty || 1),
          };
          toast.success(`${item.title} quantity updated in cart!`);
          return updatedCart;
        } else {
          toast.success(`${item.title} added to cart!`);
          return [...prev, { ...item, qty: item.qty || 1 }];
        }
      });
    }
  }, [isLoggedIn]);

  const removeFromCart = useCallback(async (itemIdOrTitle, silent = false) => {
    const itemToRemove = cart.find(
      (cartItem) => cartItem._id === itemIdOrTitle || cartItem.title === itemIdOrTitle
    );

    if (!itemToRemove) return;

    if (isLoggedIn && itemToRemove._id) {
      try {
        const response = await axiosInstance.delete(`/api/cart/remove/${itemToRemove._id}`);
        if (response.data?.data) {
          const normalizedItems = response.data.data.items
            .filter(i => i.productId !== null)
            .map(i => ({
              ...i.productId,
              qty: i.qty
            }));
          setCart(normalizedItems);
          if (!silent) {
            toast.error(`${itemToRemove.title} removed from cart!`);
          }
        }
      } catch (error) {
        console.error("Error removing item from backend cart:", error);
        toast.error("Failed to remove item");
      }
    } else {
      setCart((prevCart) => {
        if (itemToRemove && !silent) {
          toast.error(`${itemToRemove.title} removed from cart!`);
        }
        return prevCart.filter(
          (item) => item._id !== itemToRemove._id && item.title !== itemToRemove.title
        );
      });
    }
  }, [isLoggedIn, cart]);

  const updateQuantity = useCallback(
    async (itemIdOrTitle, newQuantity) => {
      const itemToUpdate = cart.find(
        (cartItem) => cartItem._id === itemIdOrTitle || cartItem.title === itemIdOrTitle
      );

      if (!itemToUpdate) return;

      if (newQuantity <= 0) {
        removeFromCart(itemIdOrTitle);
        return;
      }

      if (isLoggedIn && itemToUpdate._id) {
        try {
          const response = await axiosInstance.put("/api/cart/update", {
            productId: itemToUpdate._id,
            qty: newQuantity
          });
          if (response.data?.data) {
            const normalizedItems = response.data.data.items
              .filter(i => i.productId !== null)
              .map(i => ({
                ...i.productId,
                qty: i.qty
              }));
            setCart(normalizedItems);
          }
        } catch (error) {
          console.error("Error updating cart quantity on backend:", error);
          toast.error("Failed to update quantity");
        }
      } else {
        setCart((prevCart) =>
          prevCart.map((item) =>
            item._id === itemToUpdate._id
              ? { ...item, qty: newQuantity }
              : item
          )
        );
      }
    },
    [isLoggedIn, cart, removeFromCart]
  );

  const clearCart = useCallback(async () => {
    if (isLoggedIn) {
      try {
        await axiosInstance.delete("/api/cart");
        setCart([]);
        toast.info("Cart cleared!");
      } catch (error) {
        console.error("Error clearing backend cart:", error);
        toast.error("Failed to clear cart");
      }
    } else {
      setCart([]);
      toast.info("Cart cleared!");
    }
  }, [isLoggedIn]);

  // Calculate cart totals
  const cartTotal = cart.reduce((total, item) => {
    return total + (item.price || 0) * (item.qty || 1);
  }, 0);

  const cartItemsCount = cart.reduce((count, item) => {
    return count + (item.qty || 1);
  }, 0);

  const addToWishlist = useCallback((item) => {
    setWishlist((prev) => {
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
