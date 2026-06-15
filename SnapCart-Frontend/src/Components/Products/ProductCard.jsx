/* eslint-disable react/prop-types */
import { Heart, ShoppingCart } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CartContext from "../../context/Cart/CartContext";

const ProductCard = ({ product }) => {
  const { _id, title, image, description, price } = product;
  const navigate = useNavigate();

  const cartContext = useContext(CartContext);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Check if product is in wishlist
  useEffect(() => {
    if (cartContext.wishlist) {
      const itemInWishlist = cartContext.wishlist.find(
        (item) => item.title === title
      );
      setIsInWishlist(!!itemInWishlist);
    }
  }, [cartContext.wishlist, title]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    cartContext.addToCart({ ...product, qty: 1 });
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    if (isInWishlist) {
      cartContext.removeFromWishlist(title);
      setIsInWishlist(false);
    } else {
      cartContext.addToWishlist({ title, image, description });
      setIsInWishlist(true);
    }
  };

  const handleCardClick = () => {
    // Navigate to product details page
    navigate(`/products/${_id}`);

    setTimeout(() => {
      // Scroll to the top of the page
      window.scrollTo(0, 0);
    }, 500);
  };

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      onClick={handleCardClick}
      className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl px-4 py-5 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-56 overflow-hidden bg-slate-50 dark:bg-slate-700 rounded-xl">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* Wishlist Button - Absolute position */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-sm hover:shadow-md transition-shadow z-10 border border-white/50 dark:border-slate-600/50"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 ${
              isInWishlist
                ? "text-rose-500 fill-rose-500"
                : "text-slate-600 dark:text-slate-300 hover:text-rose-500"
            }`}
          />
        </motion.button>

        {/* Overlay gradient for dark mode */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      <div className="pt-5 flex flex-col flex-grow">
        <h3 className="text-slate-800 dark:text-slate-100 font-bold mb-1 truncate text-lg tracking-tight">
          {truncateTitle(title, 40)}
        </h3>

        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">
          {truncateDesc(description, 80)}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-slate-900 dark:text-white font-black text-xl tracking-tight">
            ₹ {price}
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 py-2 px-4 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
