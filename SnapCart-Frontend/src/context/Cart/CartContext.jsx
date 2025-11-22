import { createContext } from "react";

const CartContext = createContext({
  cart: [],
  cartLength: 0,
  cartItemsCount: 0,
  cartTotal: 0,
  wishlist: [],
  wishlistLength: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  addToWishlist: () => {},
  removeFromWishlist: () => {},
});

export default CartContext;
