/* eslint-disable react/prop-types */

import { useContext } from "react";
import CartContext from "../../context/Cart/CartContext";

const ProductCard = ({ product }) => {

  const { title, image, description, category, price } = product

  const cartContext = useContext(CartContext)

  const handleAddToCart = () => {
    cartContext.addToCart({ title, image, description, category, qty: 1 })
  }

  const handleAddToWishlist = () => {
    cartContext.addToWishlist({ title, image, description, category })
  }

  const truncateDesc = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const truncateTitle = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <>
      <div className="flex flex-col items-start justify-center gap-6  bg-transparent w-full h-auto px-4 py-6 shadow-md cursor-pointer rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="w-full h-48 overflow-hidden rounded-lg">
          <img 
            src={image} 
            alt={title} 
            className="block w-full h-full object-cover cursor-pointer transition-all duration-500 ease-in-out hover:scale-150" 
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="text-black dark:text-white text-lg">{truncateTitle(title, 40)}</span>
          <span className="text-black dark:text-white/70">{truncateDesc(description, 80)}</span>
          <span className="text-black dark:text-white/70">{category}</span> 
          <span className="text-black dark:text-white/70">Rs. {price}</span>
        </div>
        <div className="mx-auto flex items-center justify-between w-full">
          {/* <button className="bg-black text-white px-3 py-1 rounded-md">Add to Cart</button> */}
          <button className="bg-slate-600 hover:bg-black dark:text-black dark:bg-white text-white px-3 py-1 rounded-md" onClick={handleAddToCart}>Add to Cart</button>
          <button className="bg-blue-400 hover:bg-blue-500 text-white px-3 py-1 rounded-md" onClick={handleAddToWishlist}>Wishlist</button>
        </div>
      </div>
    </>
  )
}

export default ProductCard
