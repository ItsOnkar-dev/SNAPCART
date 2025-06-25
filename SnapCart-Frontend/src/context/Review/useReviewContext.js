import { useContext } from 'react';
import ReviewContext from './ReviewContext';

const useReviewContext = () => useContext(ReviewContext);

export default useReviewContext; 