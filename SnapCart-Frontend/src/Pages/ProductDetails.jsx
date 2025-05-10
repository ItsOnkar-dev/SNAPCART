import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CartContext from "../context/Cart/CartContext";
import { useProductContext } from "../context/Product/ProductContext";
import { Star, ChevronRight, ShoppingCart, Heart, Share2, Truck, ShieldCheck, ArrowLeft, Plus, Minus } from "lucide-react";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  
  const { getProductById, loading, error, getRelatedProducts } = useProductContext();
  const cartContext = useContext(CartContext);
  
  // Get the product from context
  const product = getProductById(productId);
  
  // Get related products
  const relatedProducts = getRelatedProducts(productId, 4);

  // Check if product is in wishlist
  useEffect(() => {
    if (cartContext.wishlist && product) {
      const itemInWishlist = cartContext.wishlist.find(
        (item) => item.title === product.title
      );
      setIsInWishlist(!!itemInWishlist);
    }
  }, [cartContext.wishlist, product]);

  const handleAddToCart = () => {
    if (product) {
      cartContext.addToCart({
        ...product,
        qty: quantity,
      });
    }
  };

  const handleAddToWishlist = () => {
    if (product) {
      cartContext.addToWishlist({
        title: product.title,
        image: product.image,
        description: product.description,
      });
      setIsInWishlist(true);
    }
  };

  const handleRemoveFromWishlist = () => {
    if (product) {
      cartContext.removeFromWishlist(product.title);
      setIsInWishlist(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  // Mock data for reviews
  const reviews = [
    { id: 1, name: "Jane Smith", rating: 5, comment: "Excellent product! Exactly as described.", date: "2 weeks ago" },
    { id: 2, name: "John Doe", rating: 4, comment: "Good quality for the price. Shipping was faster than expected.", date: "1 month ago" },
    { id: 3, name: "Michelle Lee", rating: 5, comment: "Perfect fit and looks great. Would recommend to anyone!", date: "2 months ago" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
        <button 
          onClick={goBack}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl">Product not found</p>
        <button 
          onClick={goBack}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { title, description, image, price } = product;
  
  // Mock data for multiple product images
  const productImages = [
    image,
    "https://via.placeholder.com/400x400?text=Image+2",
    "https://via.placeholder.com/400x400?text=Image+3",
    "https://via.placeholder.com/400x400?text=Image+4"
  ];

  // Calculate average rating
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center mb-6 text-sm">
        <button onClick={goBack} className="flex items-center text-gray-600 hover:text-blue-500">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
        <span className="text-gray-600">Products</span>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
        <span className="text-gray-900 font-medium">{title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="flex flex-col">
          <div className="bg-gray-100 rounded-lg mb-4 h-96 flex items-center justify-center overflow-hidden">
            <img 
              src={productImages[selectedImage]} 
              alt={title} 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {productImages.map((img, index) => (
              <div 
                key={index} 
                className={`cursor-pointer border-2 rounded-md h-24 overflow-hidden ${selectedImage === index ? 'border-blue-500' : 'border-gray-200'}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={img} alt={`${title} ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          
          {/* Ratings */}
          <div className="flex items-center mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">{reviews.length} reviews</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-2xl font-bold text-gray-900">₹{price}</span>
            <span className="ml-2 text-gray-500 line-through">₹{(price * 1.2).toFixed(2)}</span>
            <span className="ml-2 text-green-600 font-medium">20% Off</span>
          </div>

          {/* Short Description */}
          <p className="text-gray-600 mb-6">{description}</p>

          {/* Quantity Selector */}
          <div className="flex items-center mb-6">
            <span className="mr-4 text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-md">
              <button 
                onClick={decrementQuantity} 
                className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-l-md"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-1">{quantity}</span>
              <button 
                onClick={incrementQuantity}
                className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-r-md"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Availability */}
          <div className="mb-6">
            <span className="text-green-600 font-medium">In Stock</span>
            <span className="ml-2 text-gray-600">(10+ items available)</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
            {isInWishlist ? (
              <button 
                onClick={handleRemoveFromWishlist}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-3 px-6 rounded-md font-medium flex items-center justify-center"
              >
                <Heart className="w-5 h-5 mr-2 fill-red-600" />
                Remove from Wishlist
              </button>
            ) : (
              <button 
                onClick={handleAddToWishlist}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-md font-medium flex items-center justify-center"
              >
                <Heart className="w-5 h-5 mr-2" />
                Add to Wishlist
              </button>
            )}
          </div>

          {/* Shipping & Returns */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <Truck className="w-5 h-5 mr-2 text-gray-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Free Shipping</h3>
                  <p className="text-sm text-gray-600">For orders above ₹999</p>
                </div>
              </div>
              <div className="flex items-start">
                <ShieldCheck className="w-5 h-5 mr-2 text-gray-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">30-Day Returns</h3>
                  <p className="text-sm text-gray-600">Satisfaction guaranteed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Share */}
          <div className="flex items-center mt-6 pt-6 border-t border-gray-200">
            <span className="text-gray-700 mr-3">Share:</span>
            <div className="flex space-x-2">
              <button className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600">
                <span className="sr-only">Facebook</span>
                <Share2 className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500">
                <span className="sr-only">Twitter</span>
                <Share2 className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
                <span className="sr-only">Pinterest</span>
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-12">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("description")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "description"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("specifications")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "specifications"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "reviews"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </nav>
        </div>

        <div className="py-6">
          {activeTab === "description" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Description</h3>
              <div className="prose prose-sm max-w-none text-gray-600">
                <p className="mb-4">{description}</p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, 
                  velit vel bibendum bibendum, enim risus ultricies nisi, id aliquam 
                  magna lectus id nisi. Donec auctor, nunc vel ultricies ultricies, 
                  nisl velit aliquam magna, id aliquam magna lectus id nisi.
                </p>
                <ul className="list-disc pl-5 mt-4">
                  <li>High-quality materials</li>
                  <li>Durable construction</li>
                  <li>Easy to clean</li>
                  <li>Modern design</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "specifications" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Specifications</h3>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Brand</dt>
                    <dd className="text-sm text-gray-900 col-span-2">EcomBrand</dd>
                  </div>
                  <div className="bg-white px-4 py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Material</dt>
                    <dd className="text-sm text-gray-900 col-span-2">Premium Quality</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
                    <dd className="text-sm text-gray-900 col-span-2">10 x 5 x 3 inches</dd>
                  </div>
                  <div className="bg-white px-4 py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Weight</dt>
                    <dd className="text-sm text-gray-900 col-span-2">1.5 kg</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Warranty</dt>
                    <dd className="text-sm text-gray-900 col-span-2">1 Year</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Reviews</h3>
              
              {/* Review Summary */}
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-900 font-medium">{averageRating.toFixed(1)} out of 5</span>
                </div>
                <span className="mx-4 text-gray-300">|</span>
                <span className="text-gray-600">{reviews.length} reviews</span>
              </div>
              
              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-gray-900 font-medium">{review.name}</span>
                    </div>
                    <p className="text-gray-600 mb-1">{review.comment}</p>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                ))}
              </div>
              
              {/* Add Review Button */}
              <div className="mt-8">
                <button 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium"
                >
                  Write a Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((product) => (
              <div 
                key={product._id} 
                className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300"
                onClick={() => navigate(`/products/${product._id}`)}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-gray-900 font-medium mb-1 truncate">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-bold">₹{product.price}</span>
                    <button 
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        cartContext.addToCart({...product, qty: 1});
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;