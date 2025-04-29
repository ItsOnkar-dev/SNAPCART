import { createContext } from "react";

// Create the context with a default value
const SellerContext = createContext({
  seller: null,
  setSeller: () => {},
  approvedSellers: null,
  setApprovedSellers: () => {},
  unapprovedSellers: null,
  setUnapprovedSellers: () => {},
  errors: {},
  setErrors: () => {},
});

export default SellerContext;