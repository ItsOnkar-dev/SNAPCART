import { createContext } from 'react'

const CartContext = createContext({
  cart: [],
  cartLength: 0,
  addToCart: () => {
  }
})

export default CartContext
