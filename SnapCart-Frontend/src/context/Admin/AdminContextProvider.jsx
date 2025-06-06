import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useUserContext from "../User/useUserContext";
import AdminContext from "./AdminContext";

const AdminContextProvider = ({ children }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isLoading: userLoading } = useUserContext();

  const fetchDashboardData = async () => {
    try {
      console.log("[AdminContext] Starting fetchDashboardData");
      console.log("[AdminContext] Current user:", user);

      if (!user || user.role !== "PlatformAdmin") {
        console.log("[AdminContext] User is not a platform admin:", user);
        return;
      }

      const token = window.localStorage.getItem("token");
      console.log("[AdminContext] Token exists:", !!token);

      if (!token) {
        console.log("[AdminContext] No token found");
        return;
      }

      setLoading(true);
      setError(null);

      console.log("[AdminContext] Making API calls to fetch dashboard data");
      // Fetch stats, recent orders, sellers, buyers, and products in parallel
      const [
        statsResponse,
        ordersResponse,
        sellersResponse,
        buyersResponse,
        productsResponse,
      ] = await Promise.all([
        axios.get("http://localhost:8000/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get("http://localhost:8000/api/admin/recent-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get("http://localhost:8000/api/admin/sellers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get("http://localhost:8000/api/admin/buyers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get("http://localhost:8000/api/admin/products", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      console.log("[AdminContext] Stats response:", statsResponse.data);
      console.log("[AdminContext] Orders response:", ordersResponse.data);
      console.log("[AdminContext] Sellers response:", sellersResponse.data);
      console.log("[AdminContext] Buyers response:", buyersResponse.data);
      console.log("[AdminContext] Products response:", productsResponse.data);

      if (
        statsResponse.data.status === "success" &&
        ordersResponse.data.status === "success" &&
        sellersResponse.data.status === "success" &&
        buyersResponse.data.status === "success" &&
        productsResponse.data.status === "success"
      ) {
        setStats(statsResponse.data.data);
        setRecentOrders(ordersResponse.data.data);
        setSellers(sellersResponse.data.data);
        setBuyers(buyersResponse.data.data);
        setProducts(productsResponse.data.data);
        console.log("[AdminContext] Dashboard data updated successfully");
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("[AdminContext] Error fetching dashboard data:", error);
      console.error("[AdminContext] Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setError(
        error.response?.data?.message || "Failed to fetch dashboard data"
      );
      toast.error(
        error.response?.data?.message || "Failed to fetch dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.patch(
        `http://localhost:8000/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the order in the recentOrders state
      setRecentOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success("Order status updated successfully");
      return response.data;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update order status"
      );
      throw err;
    }
  };

  // Fetch dashboard data when component mounts and user is admin
  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const value = {
    stats,
    recentOrders,
    sellers,
    buyers,
    products,
    loading,
    error,
    fetchDashboardData,
    updateOrderStatus,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

AdminContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminContextProvider;
