import { useContext, useState, useEffect } from "react";
import UserContext from "../context/User/UserContext";
import { useNavigate } from "react-router-dom";
import { User, ShoppingBag, Package, Heart, CreditCard, Settings, LogOut, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

const Profile = () => {
  const { isLoggedIn, logout, user, updatePassword, deletedAccount, downloadUserData } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [showUsernameTooltip, setShowUsernameTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordError, setPasswordError] = useState("");

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Check if user data is loaded
  useEffect(() => {
    if (user) {
      setIsLoading(false);
    } else if (!isLoggedIn) {
      setIsLoading(false);
    }
  }, [user, isLoggedIn]);

  const handleLogOut = () => {
    logout();
    navigate("/");
  };

  const handleDelete = () => {
    deletedAccount();
    navigate("/");
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    setPasswordError("");
  };

  const handlePasswordUpdate = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password should not be your current password, please create new one");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    try {
      // Assume updatePassword is a function provided by UserContext
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);

      // Show success message
      toast.success("Password updated successfully! Please login with your new password.");

      // Store new password in sessionStorage temporarily (for demonstration purposes)
      // Note: In a real app, you'd never store passwords in the browser
      sessionStorage.setItem("tempNewPassword", passwordData.newPassword);

      // Logout and redirect to login page
      logout();
      navigate("/login");
    } catch (error) {
      setPasswordError(error.message || "Failed to update password");
      toast.error(error.message || "Failed to update password");
    }
  };

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h2 className='text-2xl font-bold mb-4'>Loading your profile...</h2>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!isLoggedIn || !user) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h2 className='text-2xl font-bold mb-4'>{!isLoggedIn ? "Please login to view your profile" : "Loading your profile..."}</h2>
        {!isLoggedIn && (
          <button onClick={() => navigate("/login")} className='bg-cyan-600 text-white font-semibold rounded-md px-6 py-2'>
            Login
          </button>
        )}
      </div>
    );
  }

  const userData = user || {};

  const styles = {
    label: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
    input: "w-full px-4 py-2 rounded-md focus:outline-none bg-gray-200 text-gray-700 dark:bg-slate-600 dark:text-white/80",
    navTab: "flex items-center gap-2 px-6 py-4 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white",
  };

  return (
    <div className='container mx-auto px-4 md:px-10 py-24 max-w-6xl'>
      {/* Header Section */}
      <div className='bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6'>
        <div className='flex flex-wrap items-center justify-between gap-10'>
          <div className='flex items-center gap-2'>
            <div className='w-20 h-20 bg-gray-300 rounded-full overflow-hidden mr-4'>
              {userData.avatar ? (
                <img src={userData.avatar} alt='Profile' className='w-full h-full object-cover' />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-cyan-500 text-white text-2xl font-bold'>{userData.username?.charAt(0).toUpperCase() || "?"}</div>
              )}
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>{userData.name || userData.username || "User"}</h1>
              <p className='text-gray-600 dark:text-gray-300'>{userData.email || "No email provided"}</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Member since {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
          <div>
            <button onClick={handleLogOut} className='bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md px-4 py-1.5 flex items-center'>
              <LogOut size={16} className='mr-2' />
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md mb-6'>
        <div className='flex items-center justify-between overflow-x-auto whitespace-nowrap scrollbar-hide'>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${styles.navTab} ${activeTab === tab.id ? "border-b-4 border-cyan-500 text-black dark:text-white" : ""}`}>
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className='bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6'>
        {activeTab === "profile" && (
          <div>
            <h2 className='text-xl font-bold mb-4 text-gray-800 dark:text-white'>Personal Information</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className={styles.label}>Full Name</label>
                <input type='text' className={styles.input} defaultValue={userData.name || ""} placeholder='Enter your full name' />
              </div>
              <div className='relative'>
                <label className={styles.label}>Username</label>
                <div className='relative' onMouseEnter={() => setShowUsernameTooltip(true)} onMouseLeave={() => setShowUsernameTooltip(false)}>
                  <input
                    type='text'
                    className='w-full px-4 py-2 rounded-md bg-gray-300 dark:bg-slate-700 dark:text-white/80 focus:outline-none cursor-not-allowed'
                    value={userData.username}
                    disabled
                  />
                  <div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                    <AlertCircle size={16} />
                  </div>

                  {/* Tooltip */}
                  {showUsernameTooltip && (
                    <div className='absolute z-10 w-64 px-4 py-3 text-sm text-white bg-gray-800 dark:text-slate-800 dark:bg-white rounded-lg shadow-lg -top-4 right-0 transform translate-y-1'>
                      Username cannot be changed once your account is created.
                      <div className='absolute right-0 -bottom-2 w-4 h-4 transform rotate-45 bg-gray-800 dark:bg-white translate-y-1 translate-x-1'></div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={styles.label}>Email</label>
                <input type='email' className={styles.input} defaultValue={userData.email} />
              </div>
              <div>
                <label className={styles.label}>Phone Number</label>
                <input type='tel' className={styles.input} defaultValue={userData.phone || ""} placeholder='Enter your phone number' />
              </div>
            </div>

            <h2 className='text-xl font-bold mt-8 mb-4 text-gray-800 dark:text-white'>Shipping Address</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className={styles.label}>Address Line 1</label>
                <input type='text' className={styles.input} defaultValue={userData.address?.line1 || ""} placeholder='Street address' />
              </div>
              <div>
                <label className={styles.label}>Address Line 2</label>
                <input type='text' className={styles.input} defaultValue={userData.address?.line2 || ""} placeholder='Apt, suite, building (optional)' />
              </div>
              <div>
                <label className={styles.label}>City</label>
                <input type='text' className={styles.input} defaultValue={userData.address?.city || ""} placeholder='City' />
              </div>
              <div>
                <label className={styles.label}>State/Province</label>
                <input type='text' className={styles.input} defaultValue={userData.address?.state || ""} placeholder='State/Province' />
              </div>
              <div>
                <label className={styles.label}>Zip/Postal Code</label>
                <input type='text' className={styles.input} defaultValue={userData.address?.zip || ""} placeholder='Zip/Postal code' />
              </div>
              <div>
                <label className={styles.label}>Country</label>
                <input type='text' className={styles.input} defaultValue={userData.address?.country || ""} placeholder='Country' />
              </div>
            </div>

            <div className='mt-8'>
              <button className='bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md px-6 py-2'>Save Changes</button>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className='text-xl font-bold mb-4 text-gray-800 dark:text-white'>Order History</h2>

            {userData.orders && userData.orders.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='min-w-full bg-white dark:bg-gray-800'>
                  <thead>
                    <tr className='border-b'>
                      <th className='py-3 px-4 text-left'>Order ID</th>
                      <th className='py-3 px-4 text-left'>Date</th>
                      <th className='py-3 px-4 text-left'>Total</th>
                      <th className='py-3 px-4 text-left'>Status</th>
                      <th className='py-3 px-4 text-left'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.orders.map((order, index) => (
                      <tr key={index} className='border-b'>
                        <td className='py-3 px-4'>{order.orderId}</td>
                        <td className='py-3 px-4'>{new Date(order.date).toLocaleDateString()}</td>
                        <td className='py-3 px-4'>${order.total.toFixed(2)}</td>
                        <td className='py-3 px-4'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              order.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Shipped"
                                ? "bg-cyan-100 text-cyan-800"
                                : order.status === "Processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className='py-3 px-4'>
                          <button onClick={() => navigate(`/orders/${order.orderId}`)} className='text-cyan-500 hover:text-cyan-700'>
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-12'>
                <ShoppingBag size={64} className='text-gray-400 mb-4' />
                <p className='text-gray-500 dark:text-gray-400 text-center'>You haven&apos;t placed any orders yet.</p>
                <button onClick={() => navigate("/products")} className='mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md px-6 py-2'>
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div>
            <h2 className='text-xl font-bold mb-4 text-gray-800 dark:text-white'>My Wishlist</h2>

            {userData.wishlist && userData.wishlist.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {userData.wishlist.map((item, index) => (
                  <div key={index} className='border rounded-lg overflow-hidden'>
                    <div className='h-40 bg-gray-200'>{item.image && <img src={item.image} alt={item.name} className='w-full h-full object-cover' />}</div>
                    <div className='p-4'>
                      <h3 className='font-semibold text-gray-800 dark:text-white mb-2'>{item.name}</h3>
                      <p className='text-gray-600 dark:text-gray-300 mb-2'>${item.price.toFixed(2)}</p>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => {
                            /* Add to cart logic */
                          }}
                          className='bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md px-4 py-1 text-sm'>
                          Add to Cart
                        </button>
                        <button
                          onClick={() => {
                            /* Remove from wishlist logic */
                          }}
                          className='bg-red-100 hover:bg-red-200 text-red-600 font-semibold rounded-md px-4 py-1 text-sm'>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-12'>
                <Heart size={64} className='text-gray-400 mb-4' />
                <p className='text-gray-500 dark:text-gray-400 text-center'>Your wishlist is empty.</p>
                <button onClick={() => navigate("/products")} className='mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md px-6 py-2'>
                  Discover Products
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "payment" && (
          <div>
            <h2 className='text-xl font-bold mb-4 text-gray-800 dark:text-white'>Payment Methods</h2>

            {userData.paymentMethods && userData.paymentMethods.length > 0 ? (
              <div className='space-y-4'>
                {userData.paymentMethods.map((method, index) => (
                  <div key={index} className='flex items-center justify-between border rounded-lg p-4'>
                    <div className='flex items-center'>
                      <div className='w-12 h-8 bg-gray-200 rounded mr-4 flex items-center justify-center'>
                        {method.type === "visa" && <span className='font-bold text-cyan-800'>VISA</span>}
                        {method.type === "mastercard" && <span className='font-bold text-red-600'>MC</span>}
                        {method.type === "amex" && <span className='font-bold text-cyan-500'>AMEX</span>}
                      </div>
                      <div>
                        <p className='font-medium text-gray-800 dark:text-white'>•••• •••• •••• {method.last4}</p>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        /* Remove payment method logic */
                      }}
                      className='text-red-500 hover:text-red-700'>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-8'>
                <CreditCard size={48} className='text-gray-400 mb-4' />
                <p className='text-gray-500 dark:text-gray-400 text-center mb-4'>You haven&apos;t added any payment methods yet.</p>
              </div>
            )}

            <div className='mt-6'>
              <button
                onClick={() => {
                  /* Add payment method logic */
                }}
                className='bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md px-6 py-2'>
                Add Payment Method
              </button>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className=''>
            <h2 className='text-xl font-bold mb-6 text-gray-800 dark:text-white'>Account Settings</h2>

            <div className='space-y-12'>
              <div>
                <h3 className='text-lg font-semibold mb-6 text-gray-700 dark:text-gray-300'>Password</h3>
                <div className='space-y-6'>
                  {passwordError && <p className='text-red-500 text-sm'>{passwordError}</p>}
                  <div>
                    <label className={styles.label}>Current Password</label>
                    <input
                      type='password'
                      name='currentPassword'
                      className={`${styles.input} md:w-1/2`}
                      placeholder='Enter current password'
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>New Password</label>
                    <input
                      type='password'
                      name='newPassword'
                      className={`${styles.input} md:w-1/2`}
                      placeholder='Enter new password'
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Confirm New Password</label>
                    <input
                      type='password'
                      name='confirmPassword'
                      className={`${styles.input} md:w-1/2`}
                      placeholder='Confirm new password'
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <button className='bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md px-6 py-2' onClick={handlePasswordUpdate}>
                    Update Password
                  </button>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300'>Notifications</h3>
                <div className='space-y-3'>
                  <div className='flex items-center'>
                    <input type='checkbox' id='orderUpdates' className='h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded' defaultChecked={userData.notifications?.orderUpdates} />
                    <label htmlFor='orderUpdates' className='ml-2 block text-gray-700 dark:text-gray-300'>
                      Order updates
                    </label>
                  </div>
                  <div className='flex items-center'>
                    <input type='checkbox' id='promotions' className='h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded' defaultChecked={userData.notifications?.promotions} />
                    <label htmlFor='promotions' className='ml-2 block text-gray-700 dark:text-gray-300'>
                      Promotions and deals
                    </label>
                  </div>
                  <div className='flex items-center'>
                    <input type='checkbox' id='newsletter' className='h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded' defaultChecked={userData.notifications?.newsletter} />
                    <label htmlFor='newsletter' className='ml-2 block text-gray-700 dark:text-gray-300'>
                      Newsletter
                    </label>
                  </div>
                  <button className='bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md px-6 py-2 mt-2'>Save Preferences</button>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300'>Account Actions</h3>
                <div className='flex flex-col sm:flex-row items-start gap-6 sm:items-center justify-between py-2'>
                  <button className='bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-md px-6 py-2' onClick={downloadUserData}>
                    Download My Data
                  </button>
                  <button className='bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md px-6 py-2' onClick={handleDelete}>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
