/* eslint-disable react/prop-types */
import { Edit, Star, Trash2 } from "lucide-react";
import { useEffect } from "react";
import ReviewContextProvider from "../../context/Review/ReviewContextProvider";
import useReviewContext from "../../context/Review/useReviewContext";

const ReviewsInner = ({ productId, isLoggedIn, user, onReviewsChange }) => {
  const {
    reviews,
    reviewsLoading,
    fetchReviews,
    showReviewModal,
    setShowReviewModal,
    reviewText,
    setReviewText,
    reviewRating,
    setReviewRating,
    submittingReview,
    handleReviewSubmit,
    editReviewId,
    editReviewText,
    editReviewRating,
    setEditReviewText,
    setEditReviewRating,
    editSubmitting,
    handleEditReview,
    handleCancelEdit,
    handleUpdateReview,
    deleteSubmitting,
    handleDeleteReview,
  } = useReviewContext();

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId, fetchReviews]);

  // Call onReviewsChange whenever reviews change
  useEffect(() => {
    if (onReviewsChange) {
      onReviewsChange(reviews.length);
    }
  }, [reviews, onReviewsChange]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
        reviews.length
      : 0;

  return (
    <div id="tab-reviews" role="tabpanel" aria-labelledby="tab-reviews-tab">
      <h3
        className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
        id="reviews"
      >
        Customer Reviews ({reviews.length})
      </h3>
      {/* Review Summary */}
      <div className="flex flex-col md:flex-row md:items-center mb-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-4">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <div>
            <div className="flex mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              Based on {reviews.length} reviews
            </span>
          </div>
        </div>
        <div className="md:ml-auto">
          {isLoggedIn && (
            <button
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm"
              aria-label="Write a review"
              onClick={() => setShowReviewModal(true)}
            >
              Write a Review
            </button>
          )}
        </div>
      </div>
      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg px-6 py-10 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-2 right-6 text-gray-400 hover:text-gray-700 dark:hover:text-white text-3xl"
              onClick={() => setShowReviewModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h4 className="text-lg font-semibold mb-4">Write a Review</h4>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Rating</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`w-8 h-8 focus:outline-none ${
                        star <= reviewRating
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                      onClick={() => setReviewRating(star)}
                    >
                      <Star className="w-6 h-6" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Review</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 w-full"
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Reviews List */}
      <div className="space-y-6">
        {reviewsLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          reviews.map((review, idx) => (
            <div
              key={review._id || idx}
              className="border-b border-gray-200 dark:border-gray-700 pb-6"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold">
                    <span>
                      {review.user && review.user.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-cyan-500 text-white text-2xl font-bold">${
                              review.user.name?.charAt(0).toUpperCase() ||
                              review.user.username?.charAt(0).toUpperCase() ||
                              "?"
                            }</div>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-cyan-500 text-white text-2xl font-bold">
                          {review.user?.name?.charAt(0).toUpperCase() ||
                            review.user?.username?.charAt(0).toUpperCase() ||
                            "?"}
                        </div>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-center gap-2 ">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {review.user && review.user.name
                        ? review.user.name
                        : "User"}
                    </h4>
                    {/* Only show edit/delete if current user is the author */}
                    {user && review.user && user._id === review.user._id && (
                      <div className="flex items-center gap-6">
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit Review"
                          onClick={() => handleEditReview(review)}
                          disabled={editSubmitting || deleteSubmitting}
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          title="Delete Review"
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={
                            deleteSubmitting === review._id || editSubmitting
                          }
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Edit form for this review */}
                  {editReviewId === review._id ? (
                    <form onSubmit={handleUpdateReview} className="mb-2">
                      <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            className={`w-6 h-6 focus:outline-none ${
                              star <= editReviewRating
                                ? "text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                            onClick={() => setEditReviewRating(star)}
                          >
                            <Star className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white mb-2"
                        rows={3}
                        value={editReviewText}
                        onChange={(e) => setEditReviewText(e.target.value)}
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-lg transition-colors duration-300"
                          disabled={editSubmitting}
                        >
                          {editSubmitting ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded-lg transition-colors duration-300"
                          onClick={handleCancelEdit}
                          disabled={editSubmitting}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (review.rating || 0)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {review.review}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Reviews = (props) => (
  <ReviewContextProvider
    productId={props.productId}
    isLoggedIn={props.isLoggedIn}
  >
    <ReviewsInner {...props} user={props.user} />
  </ReviewContextProvider>
);

export default Reviews;
