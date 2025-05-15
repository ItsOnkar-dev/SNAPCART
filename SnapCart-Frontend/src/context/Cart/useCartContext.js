import { useContext } from 'react';
import CartContext from './CartContext';
 
const useCartContext = () => useContext(CartContext);
export default useCartContext; 