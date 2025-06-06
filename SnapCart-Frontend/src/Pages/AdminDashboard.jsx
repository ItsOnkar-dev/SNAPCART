import {
  AlertCircle,
  IndianRupee,
  Package,
  RefreshCw,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAdminContext from "../context/Admin/useAdminContext";
import useUserContext from "../context/User/useUserContext";

const AdminDashboard = () => {
  const {
    stats,
    recentOrders,
    sellers,
    buyers,
    loading,
    error,
    fetchDashboardData,
    updateOrderStatus,
    products,
  } = useAdminContext();
  const { user, isLoading: userLoading } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[AdminDashboard] User state:", {
      userLoading,
      user,
      role: user?.role,
      isAdmin: user?.role === "PlatformAdmin",
    });

    // Only redirect if we're sure the user is not an admin
    if (!userLoading && user && user.role !== "PlatformAdmin") {
      console.log("[AdminDashboard] Redirecting to home - User is not admin");
      navigate("/");
    }
  }, [user, userLoading, navigate]);

  // Show loading state while checking user role
  if (userLoading) {
    console.log(
      "[AdminDashboard] Showing loading state - User data is loading"
    );
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Show loading state while fetching dashboard data
  if (loading) {
    console.log(
      "[AdminDashboard] Showing loading state - Dashboard data is loading"
    );
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    console.log("[AdminDashboard] Showing error state:", error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle size={24} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={20} />
          Refresh Data
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Users className="text-blue-600 dark:text-blue-300" size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Total Users
              </p>
              <p className="text-2xl font-semibold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Package
                className="text-green-600 dark:text-green-300"
                size={24}
              />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Total Products
              </p>
              <p className="text-2xl font-semibold">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <ShoppingCart
                className="text-purple-600 dark:text-purple-300"
                size={24}
              />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Total Orders
              </p>
              <p className="text-2xl font-semibold">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <IndianRupee
                className="text-yellow-600 dark:text-yellow-300"
                size={24}
              />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Total Revenue
              </p>
              <p className="text-2xl font-semibold">₹{stats.totalRevenue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-4">Order ID</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} className="border-b dark:border-gray-700">
                  <td className="py-3 px-4">{order._id}</td>
                  <td className="py-3 px-4">{order.customerName}</td>
                  <td className="py-3 px-4">₹{order.totalAmount}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="text-sm border rounded px-2 py-1 bg-white dark:bg-slate-700"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Management Sections */}
      <div className="space-y-6">
        {/* Product Management - Full Width */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Product Management</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Oversee product listings, categories, and inventory
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="py-2 px-3 text-left">Product Name</th>
                  <th className="py-2 px-3 text-left">Price</th>
                  <th className="py-2 px-3 text-left">Seller</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b dark:border-gray-700"
                  >
                    <td className="py-2 px-3">{product.title}</td>
                    <td className="py-2 px-3">₹{product.price}</td>
                    <td className="py-2 px-3">
                      {product.sellerId?.username || "N/A"}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.status || "active"}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User and Seller Management - Side by Side */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* User Management */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Manage user accounts, permissions, and access levels
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="py-2 px-3 text-left">Username</th>
                    <th className="py-2 px-3 text-left">Email</th>
                    <th className="py-2 px-3 text-left">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b dark:border-gray-700"
                    >
                      <td className="py-2 px-3">{user.username}</td>
                      <td className="py-2 px-3">{user.email}</td>
                      <td className="py-2 px-3">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Seller Management */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Seller Management</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Handle seller accounts, verifications, and performance
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="py-2 px-3 text-left">Username</th>
                    <th className="py-2 px-3 text-left">Email</th>
                    <th className="py-2 px-3 text-left">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller) => (
                    <tr
                      key={seller._id}
                      className="border-b dark:border-gray-700"
                    >
                      <td className="py-2 px-3">{seller.username}</td>
                      <td className="py-2 px-3">{seller.email}</td>
                      <td className="py-2 px-3">{seller.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
