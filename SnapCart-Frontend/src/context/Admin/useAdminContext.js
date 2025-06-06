import { useContext } from 'react';
import AdminContext from './AdminContext';

const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within an AdminContextProvider');
  }
  return context;
};

export default useAdminContext; 