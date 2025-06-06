import { createContext } from 'react';

const AdminContext = createContext({
  stats: {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  },
  recentOrders: [],
  loading: false,
  error: null,
  fetchDashboardData: () => {},
  updateOrderStatus: () => {}
});

export default AdminContext; 