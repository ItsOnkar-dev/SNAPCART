/* eslint-disable react/prop-types */
import AdminContextProvider from "./context/Admin/AdminContextProvider";
import CartContextProvider from "./context/Cart/CartContextProvider";
import ProductContextProvider from "./context/Product/ProductContextProvider";
import ReviewContextProvider from "./context/Review/ReviewContextProvider";
import SellerContextProvider from "./context/Seller/SellerContextProvider";
import SidebarContextProvider from "./context/Sidebar/SidebarContextProvider";
import UserContextProvider from "./context/User/UserContextProvider";

// Component that combines all context providers
const AppProviders = ({ children }) => {
  return (
    <UserContextProvider>
      <CartContextProvider>
        <SellerContextProvider>
          <ProductContextProvider>
            <AdminContextProvider>
              <SidebarContextProvider>
                <ReviewContextProvider>{children}</ReviewContextProvider>
              </SidebarContextProvider>
            </AdminContextProvider>
          </ProductContextProvider>
        </SellerContextProvider>
      </CartContextProvider>
    </UserContextProvider>
  );
};

export default AppProviders;
