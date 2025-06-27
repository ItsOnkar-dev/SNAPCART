/* eslint-disable react/prop-types */
import axios from "axios";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import ReviewContext from "./ReviewContext";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ReviewContextProvider = ({ productId, isLoggedIn, children }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(null);

  // Fetch reviews from backend
  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/products/${productId}/reviews`
      );
      setReviews(res.data.data || []);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const token = window.localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/products/${productId}/reviews`,
        { rating: reviewRating, review: reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Review submitted!");
      setShowReviewModal(false);
      setReviewText("");
      setReviewRating(5);
      fetchReviews();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit review. Try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    setDeleteSubmitting(reviewId);
    try {
      const token = window.localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/api/products/${productId}/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete review. Try again."
      );
    } finally {
      setDeleteSubmitting(null);
    }
  };

  // Start editing a review
  const handleEditReview = (review) => {
    setEditReviewId(review._id);
    setEditReviewText(review.review);
    setEditReviewRating(review.rating);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditReviewId(null);
    setEditReviewText("");
    setEditReviewRating(5);
  };

  // Submit updated review
  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editReviewText.trim()) {
      toast.error("Review text is required");
      return;
    }
    setEditSubmitting(true);
    try {
      const token = window.localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/api/products/${productId}/reviews/${editReviewId}`,
        { rating: editReviewRating, review: editReviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Review updated!");
      setEditReviewId(null);
      setEditReviewText("");
      setEditReviewRating(5);
      fetchReviews();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update review. Try again."
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        setReviews,
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
        setEditReviewId,
        editSubmitting,
        handleEditReview,
        handleCancelEdit,
        handleUpdateReview,
        deleteSubmitting,
        handleDeleteReview,
        isLoggedIn,
        productId,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export default ReviewContextProvider;
