import axios from "axios";
import {
  ArrowLeft,
  ChevronRight,
  Facebook,
  Heart,
  Instagram,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Twitter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Reviews from "../Components/Products/Reviews";
import useCartContext from "../context/Cart/useCartContext";
import useProductContext from "../context/Product/useProductContext";
import useUserContext from "../context/User/useUserContext";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [reviewsCount, setReviewsCount] = useState(0);

  const { getProductById, loading, error, getRelatedProducts } =
    useProductContext();
  const { addToCart, wishlist, addToWishlist, removeFromWishlist } =
    useCartContext();
  const { user, isLoggedIn } = useUserContext();

  // Get the product from context
  const product = getProductById(productId);

  // Fetch full product details from backend for always-populated seller info
  const [fullProduct, setFullProduct] = useState(null);
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/products/${productId}`
        );
        setFullProduct(res.data.data);
      } catch {
        setFullProduct(null);
      }
    };
    if (productId) fetchProductDetails();
  }, [productId]);

  // Fetch reviews count separately
  useEffect(() => {
    const fetchReviewsCount = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/products/${productId}/reviews`
        );
        setReviewsCount(res.data.data?.length || 0);
      } catch {
        setReviewsCount(0);
      }
    };
    if (productId) fetchReviewsCount();
  }, [productId]);

  // Get related products
  const relatedProducts = getRelatedProducts(productId, 4);

  // Check if product is in wishlist
  useEffect(() => {
    if (wishlist?.length && product) {
      const itemInWishlist = wishlist.find(
        (item) => item.title === product.title
      );
      setIsInWishlist(!!itemInWishlist);
    }
  }, [wishlist, product]);

  const handleCardClick = (id) => {
    navigate(`/products/${id}`);
    window.scrollTo(0, 0);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        ...product,
        qty: quantity,
      });
    }
  };

  const handleAddToWishlist = () => {
    if (product) {
      addToWishlist({
        title: product.title,
        image: product.image,
        description: product.description,
      });
      setIsInWishlist(true);
    }
  };

  const handleRemoveFromWishlist = () => {
    if (product) {
      removeFromWishlist(product.title);
      setIsInWishlist(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const goBack = () => {
    navigate("/");
  };

  // Function to update reviews count when reviews change
  const handleReviewsChange = (newCount) => {
    setReviewsCount(newCount);
  };

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
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
          aria-label="Go back"
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
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
          aria-label="Go back"
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
    image,
  ];

  const discountPrice = (price * 1.2).toFixed(2);
  const discountPercentage = 20;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-24">
      <div className="flex items-center mb-8 text-sm">
        <button
          onClick={goBack}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
        <span
          onClick={goBack}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white/80 transition-colors duration-200 cursor-pointer"
        >
          Products
        </span>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
        <span className="text-gray-900 dark:text-gray-300 font-medium">
          {title}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
        <div className="flex flex-col">
          <div className="rounded-xl mb-4 h-96 flex items-center justify-center overflow-hidden">
            <img
              src={productImages[selectedImage]}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          Thumbnail Images
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {productImages.map((img, index) => (
              <div
                key={index}
                className={`cursor-pointer border-2 rounded-md h-24 overflow-hidden ${
                  selectedImage === index
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={img}
                  alt={`${title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          {/* Badge and title */}
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300 mb-2">
              In Stock
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {fullProduct && fullProduct.sellerId && (
              <p className="text-sm font-medium text-gray-600 dark:text-white/70">
                Seller :{" "}
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {typeof fullProduct.sellerId === "object" &&
                  fullProduct.sellerId.username
                    ? fullProduct.sellerId.username
                    : "Unknown"}
                </span>
              </p>
            )}
          </div>

          {/* Ratings are now handled in the Reviews component */}

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ₹{price}
              </span>
              <span className="ml-3 text-lg text-gray-500 dark:text-gray-400 line-through">
                ₹{discountPrice}
              </span>
              <span className="ml-2 px-2.5 py-0.5 bg-green-100 text-green-800 text-sm font-medium rounded-md dark:bg-green-900 dark:text-green-300">
                {discountPercentage}% Off
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Inclusive of all taxes
            </p>
          </div>

          {/* Short Description */}
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300">{description}</p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center mb-8">
            <span className="mr-4 text-gray-700 dark:text-gray-300 font-medium">
              Quantity:
            </span>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={decrementQuantity}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg transition-colors duration-200"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="w-12 text-center py-2 font-medium text-gray-900 dark:text-white">
                {quantity}
              </div>
              <button
                onClick={incrementQuantity}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg transition-colors duration-200"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="ml-4">
              <span className="text-green-600 font-medium">In Stock</span>
              <span className="ml-1 text-gray-600 dark:text-gray-400 text-sm">
                (10+ available)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
            {isInWishlist ? (
              <button
                onClick={handleRemoveFromWishlist}
                className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-colors duration-300 border border-red-200 dark:border-red-800"
                aria-label="Remove from wishlist"
              >
                <Heart className="w-5 h-5 mr-2 fill-red-600 dark:fill-red-400" />
                Remove from Wishlist
              </button>
            ) : (
              <button
                onClick={handleAddToWishlist}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-colors duration-300 border border-gray-200 dark:border-gray-700"
                aria-label="Add to wishlist"
              >
                <Heart className="w-5 h-5 mr-2" />
                Add to Wishlist
              </button>
            )}
          </div>

          {/* Shipping & Returns */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-8">
            <div className="grid grid-cols-2 gap-4 place-items-center">
              <div className="flex items-center">
                <Truck className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Fast Delivery
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Free shipping on orders above ₹999
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    30-Day Returns
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Satisfaction guaranteed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Share */}
          <div className="flex items-center pt-4">
            <span className="text-gray-700 dark:text-gray-300 mr-3">
              Share:
            </span>
            <div className="flex space-x-3">
              <button
                className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors duration-300"
                aria-label="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                className="w-9 h-9 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500 transition-colors duration-300"
                aria-label="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                className="w-9 h-9 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 transition-colors duration-300"
                aria-label="Share on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-16">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav
            className="flex flex-wrap space-x-2 sm:space-x-8"
            aria-label="Product information"
          >
            <button
              onClick={() => setActiveTab("description")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors duration-200 ${
                activeTab === "description"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              aria-selected={activeTab === "description"}
              aria-controls="tab-description"
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("specifications")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors duration-200 ${
                activeTab === "specifications"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              aria-selected={activeTab === "specifications"}
              aria-controls="tab-specifications"
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors duration-200 ${
                activeTab === "reviews"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              aria-selected={activeTab === "reviews"}
              aria-controls="tab-reviews"
            >
              Reviews ({reviewsCount})
            </button>
          </nav>
        </div>

        <div className="py-6">
          {activeTab === "description" && (
            <div
              id="tab-description"
              role="tabpanel"
              aria-labelledby="tab-description-tab"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Product Description
              </h3>
              <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                <p className="mb-4">{description}</p>
                <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                      Key Features
                    </h4>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 p-1 mr-2">
                          <svg
                            className="h-3 w-3 text-blue-600 dark:text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </span>
                        High-quality premium materials
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 p-1 mr-2">
                          <svg
                            className="h-3 w-3 text-blue-600 dark:text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </span>
                        Durable construction for long-lasting use
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 p-1 mr-2">
                          <svg
                            className="h-3 w-3 text-blue-600 dark:text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </span>
                        Easy to clean and maintain
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 p-1 mr-2">
                          <svg
                            className="h-3 w-3 text-blue-600 dark:text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </span>
                        Modern sleek design
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      What&apos;s Included
                    </h4>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start">
                        <span className="text-blue-600 dark:text-blue-400 mr-2">
                          •
                        </span>
                        1 × Main product
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 dark:text-blue-400 mr-2">
                          •
                        </span>
                        User manual
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 dark:text-blue-400 mr-2">
                          •
                        </span>
                        Warranty card
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 dark:text-blue-400 mr-2">
                          •
                        </span>
                        Quality certificate
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specifications" && (
            <div
              id="tab-specifications"
              role="tabpanel"
              aria-labelledby="tab-specifications-tab"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Product Specifications
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                <dl>
                  <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-5 grid grid-cols-3 gap-4 items-center">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Manufacturer
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                      EcomBrand Inc.
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Technical Details
                </h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    This product has been tested and certified to meet all
                    industry standards. The materials used are environmentally
                    friendly and comply with international regulations.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Energy efficient
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Low carbon footprint
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Recyclable packaging
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Sustainable materials
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <Reviews
              productId={productId}
              isLoggedIn={isLoggedIn}
              user={user}
              onReviewsChange={handleReviewsChange}
            />
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Related Products
            </h2>
            <span
              onClick={goBack}
              className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer"
            >
              View all
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <div
                key={product._id}
                className="group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
                onClick={() => handleCardClick(product._id)}
              >
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-56 object-center object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 truncate">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-white font-bold">
                      ₹{product.price}
                    </span>
                    <button
                      className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({ ...product, qty: 1 });
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
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
