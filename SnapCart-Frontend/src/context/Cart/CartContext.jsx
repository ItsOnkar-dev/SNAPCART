import { createContext } from 'react';

const CartContext = createContext({
  cart: [],
  cartLength: 0,
  wishlist: [], // Changed from wishList to wishlist
  wishlistLength: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  addToWishlist: () => {},
  removeFromWishlist: () => {},
});

export default CartContext;