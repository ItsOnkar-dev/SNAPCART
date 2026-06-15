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
import { motion } from "framer-motion";
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
    if (!userLoading && user && user.role !== "PlatformAdmin") {
      navigate("/");
    }
  }, [user, userLoading, navigate]);

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-6 rounded-2xl flex items-center gap-3 shadow-sm border border-red-100 dark:border-red-800/50">
          <AlertCircle size={24} />
          <span className="font-medium">{error}</span>
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

  const allUsers = [
    ...buyers,
    ...(user && user.role === "PlatformAdmin" ? [user] : []),
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 md:px-10 font-sans text-slate-800 dark:text-slate-200">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-between items-center mb-10 gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Admin Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Platform overview and management</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDashboardData}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl hover:shadow-md transition-all font-medium shadow-sm"
          >
            <RefreshCw size={18} className="text-cyan-500" />
            Refresh Data
          </motion.button>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
              <Users className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Users</p>
              <p className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">{stats.totalUsers}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
              <Package className="text-emerald-600 dark:text-emerald-400" size={28} />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Products</p>
              <p className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">{stats.totalProducts}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20 rounded-2xl border border-purple-100 dark:border-purple-800/30">
              <ShoppingCart className="text-purple-600 dark:text-purple-400" size={28} />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Orders</p>
              <p className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">{stats.totalOrders}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/20 rounded-2xl border border-amber-100 dark:border-amber-800/30">
              <IndianRupee className="text-amber-600 dark:text-amber-400" size={28} />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Revenue</p>
              <p className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 md:p-8 mb-10 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <th className="py-4 px-4 font-semibold">Order ID</th>
                  <th className="py-4 px-4 font-semibold">Customer</th>
                  <th className="py-4 px-4 font-semibold">Amount</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-4 font-semibold">Date</th>
                  <th className="py-4 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group">
                    <td className="py-4 px-4 text-sm font-mono text-slate-500 dark:text-slate-400">{order._id.substring(0, 8)}...</td>
                    <td className="py-4 px-4 font-medium">{order.customerName}</td>
                    <td className="py-4 px-4 font-bold">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === "completed"
                            ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : order.status === "processing"
                            ? "bg-amber-100/50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : order.status === "cancelled"
                            ? "bg-rose-100/50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                            : "bg-slate-100/50 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all cursor-pointer"
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
        </motion.div>

        {/* Management Sections */}
        <div className="space-y-8">
          {/* Product Management - Full Width */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 md:p-8"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Product Management</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Oversee product listings, categories, and inventory</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 text-sm font-medium">
                    <th className="py-4 px-4 font-semibold">#</th>
                    <th className="py-4 px-4 font-semibold">Product Name</th>
                    <th className="py-4 px-4 font-semibold">Price</th>
                    <th className="py-4 px-4 font-semibold">Seller</th>
                    <th className="py-4 px-4 font-semibold">Status</th>
                    <th className="py-4 px-4 font-semibold text-right">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                  {products.slice(0, 10).map((product, idx) => (
                    <tr key={product._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 px-4 text-sm text-slate-500">{idx + 1}</td>
                      <td className="py-4 px-4 font-medium">{product.title.length > 40 ? product.title.substring(0, 40) + '...' : product.title}</td>
                      <td className="py-4 px-4 font-bold">₹{product.price}</td>
                      <td className="py-4 px-4 text-sm">{product.sellerId?.username || "N/A"}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.status === "active" ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100/50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"}`}>
                          {product.status || "active"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400 text-right">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* User and Seller Management - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Management */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 md:p-8 flex flex-col h-full"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">User Management</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage user accounts and roles</p>
              </div>
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 text-sm font-medium">
                      <th className="py-3 px-3 font-semibold">User</th>
                      <th className="py-3 px-3 font-semibold">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                    {allUsers.slice(0, 5).map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{u.username}</span>
                            <span className="text-xs text-slate-500">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'PlatformAdmin' ? 'bg-purple-100/50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100/50 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Seller Management */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 md:p-8 flex flex-col h-full"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Seller Management</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Handle seller accounts and verification</p>
              </div>
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 text-sm font-medium">
                      <th className="py-3 px-3 font-semibold">Seller</th>
                      <th className="py-3 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                    {sellers.slice(0, 5).map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{s.username}</span>
                            <span className="text-xs text-slate-500">{s.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
