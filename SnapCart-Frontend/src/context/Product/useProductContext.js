import { useContext } from 'react';
import ProductContext from './ProductContext';
 
const useProductContext = () => useContext(ProductContext);
export default useProductContext; 