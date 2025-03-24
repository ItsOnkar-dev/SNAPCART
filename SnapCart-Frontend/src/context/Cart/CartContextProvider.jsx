/* eslint-disable react/prop-types */
import { useState } from "react"
import CartContext from "./CartContext"

const CartContextProvider = ({ children }) => {

  const [cart, setCart] = useState([])

  const addToCart = (item) => {
    setCart((prev) => [...prev, item])
  }

  const removeFromCart = (title) => {
    setCart((prevCart) => prevCart.filter((item) => item.title !== title));
  };

  // const context = {
  //   cart: cart,
  //   cartLength: cart.length,
  //   addToCart: addToCart,
  // }

  return (
    <CartContext.Provider value={{ cart, cartLength: cart.length, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  )
}

export default CartContextProvider


