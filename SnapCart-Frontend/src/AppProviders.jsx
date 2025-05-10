/* eslint-disable react/prop-types */
// src/context/AppProviders.jsx
import CartContextProvider from "./context/Cart/CartContextProvider";
import UserContextProvider from "./context/User/UserContextProvider";
import SellerContextProvider from "./context/Seller/SellerContextProvider";
import { ProductProvider } from "./context/Product/ProductContext";

// Component that combines all context providers
const AppProviders = ({ children }) => {
  return (
    <UserContextProvider>
      <CartContextProvider>
        <SellerContextProvider>
          <ProductProvider>
            {children}
          </ProductProvider>
        </SellerContextProvider>
      </CartContextProvider>
    </UserContextProvider>
  );
};

export default AppProviders;