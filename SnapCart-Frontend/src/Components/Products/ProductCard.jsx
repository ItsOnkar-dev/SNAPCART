/* eslint-disable react/prop-types */
import { Heart, ShoppingCart } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div
      onClick={handleCardClick}
      className="group border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-md px-4 py-6 transition-shadow duration-300 cursor-pointer"
    >
      <div className="relative h-52 overflow-hidden bg-gray-100 rounded-lg">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover cursor-pointer group-hover:scale-125 transition-transform duration-500"
        />
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-5 h-5 ${
              isInWishlist
                ? "text-red-500 fill-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>
      </div>

      <div className="pt-5">
        <h3 className="text-gray-900 dark:text-white font-semibold mb-1 truncate">
          {truncateTitle(title, 40)}
        </h3>

        <p className="text-gray-600 dark:text-white/70 text-sm mb-2 line-clamp-2">
          {truncateDesc(description, 80)}
        </p>

        <div className="flex items-center justify-between mt-5">
          <span className="text-gray-900 dark:text-white font-bold">
            ₹ {price}
          </span>

          <button
            onClick={handleAddToCart}
            className="flex items-center text-white bg-blue-500 hover:bg-blue-600 py-1.5 px-3 rounded-md text-sm font-medium"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
