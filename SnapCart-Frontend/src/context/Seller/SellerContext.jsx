import { createContext } from "react";

// Create the context with a default value
const SellerContext = createContext({
  seller: null,
  setSeller: () => {},
  errors: {},
  setErrors: () => {},
});

export default SellerContext;