import useSellerContext from "../context/Seller/useSellerContext";

const AdminDashboard = () => {
  const {seller, unapprovedSellers, handleApproveSeller } = useSellerContext();

  if (!seller) return <div>Loading seller data...</div>;
  return (
    <div className='container mx-auto p-8'>
      <h1 className='text-3xl font-bold mb-6'>Admin Dashboard</h1>

      {/* Display Unapproved Sellers */}
      <h2 className='text-2xl font-bold mb-4'>Unapproved Sellers</h2>
      {unapprovedSellers.length > 0 ? (
        <ul className='space-y-4'>
          {unapprovedSellers.map((seller) => (
            <li key={seller._id} className='border p-4 rounded-md shadow-sm'>
              <h3 className='font-semibold'>{seller.name}</h3>
              <p>Email: {seller.email}</p>
              <p>Store Name: {seller.storeName}</p>
              <p>Store Description: {seller.storeDescription}</p>
              <button onClick={() => handleApproveSeller(seller._id)} className='mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>
                Approve
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No unapproved sellers found.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
