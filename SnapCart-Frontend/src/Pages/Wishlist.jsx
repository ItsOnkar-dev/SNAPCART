import { useContext } from "react";
import useCartContext from "../context/Cart/useCartContext";
import { Trash2, ShoppingBag, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

const WishList = () => {
  const { wishlist, removeFromWishlist, addToCart } = useCartContext();

  const moveToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item.title);
  };

  return (
    <div className='py-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto'>
      {/* Header Section */}
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-800 dark:text-white'>
          My Wishlist <span className='text-gray-500 font-normal'>({wishlist.length} items)</span>
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20'>
          <div className='bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6'>
            <Bookmark size={64} className='text-gray-400' />
          </div>
          <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>Your wishlist is empty</h2>
          <p className='text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md'>Save items you love to your wishlist. Review them anytime and easily move them to the cart.</p>
          <button onClick={() => (window.location.href = "/")} className='bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-md font-medium transition-colors'>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {wishlist.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className='bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 flex flex-col'>
              {/* Product Image with hover effect */}
              <div className='relative group h-64 overflow-hidden'>
                <img src={item.image} alt={item.title} className='w-full h-full object-contain object-center p-4 group-hover:scale-105 transition-transform duration-300' />

                {/* Quick actions overlay */}
                <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-end justify-center transition-all duration-300'>
                  <div className='flex gap-2 mb-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300'>
                    <button onClick={() => moveToCart(item)} className='bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700 transition-colors' title='Move to Cart'>
                      <ShoppingBag size={20} />
                    </button>
                    <button onClick={() => removeFromWishlist(item.title)} className='bg-white text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors' title='Remove from Wishlist'>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className='p-4 flex-grow flex flex-col'>
                <div className='flex-grow'>
                  <h3 className='font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-1'>{item.title}</h3>
                  <p className='text-gray-500 dark:text-gray-400 text-xs mb-2'>{item.category}</p>
                  <p className='text-xs text-gray-600 dark:text-gray-300 line-clamp-2'>{item.description}</p>
                </div>

                <div className='pt-3 mt-3 border-t border-gray-200 dark:border-gray-700'>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center'>
                      <span className='font-semibold text-gray-900 dark:text-white'>₹{item.price?.toFixed(2) || "0.00"}</span>
                      {item.oldPrice && <span className='ml-2 text-gray-500 line-through text-sm'>${item.oldPrice.toFixed(2)}</span>}
                    </div>
                    {item.discount && <span className='text-xs font-medium text-green-600 dark:text-green-400'>{item.discount}% OFF</span>}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className='px-4 pb-4'>
                <button
                  onClick={() => moveToCart(item)}
                  className='w-full bg-pink-50 text-pink-600 border border-pink-200 py-2 px-4 rounded font-medium 
                           hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all duration-300'>
                  Move to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishList;
