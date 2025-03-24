/* eslint-disable react/prop-types */

import { useContext } from "react";
import CartContext from "../../context/Cart/CartContext";

const ProductCard = ({ product }) => {

  const { title, image, description, category } = product

  const cartContext = useContext(CartContext)

  const handleAddToCart = () => {
    cartContext.addToCart({ title, image, description, category, qty: 1 })
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
      <div className="flex flex-col items-start justify-center gap-6  bg-transparent w-full h-auto px-4 py-6 shadow-md cursor-pointer rounded-md border border-gray-200 dark:border-gray-700">
        <img src={image} alt={title} className="block m-auto w-56 h-44 object-contain cursor-pointer transition-all duration-300 ease-in-out hover:scale-110" />
        <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
          <h2><span className="text-black dark:text-white">Title:</span> {truncateTitle(title, 40)}</h2>
          <p><span className="text-black dark:text-white">Description: </span>{truncateDesc(description, 80)}</p>
          <p ><span className="text-black dark:text-white">Category:</span> {category}</p>
        </div>
        <div className="mx-auto flex items-center justify-between w-full">
          {/* <button className="bg-black text-white px-3 py-1 rounded-md">Add to Cart</button> */}
          <button className="bg-slate-600 hover:bg-black dark:text-black dark:bg-white text-white px-3 py-1 rounded-md" onClick={handleAddToCart}>Add to Cart</button>
          <button className="bg-blue-400 hover:bg-blue-500 text-white px-3 py-1 rounded-md">Wishlist</button>
        </div>
      </div>
    </>
  )
}

export default ProductCard
