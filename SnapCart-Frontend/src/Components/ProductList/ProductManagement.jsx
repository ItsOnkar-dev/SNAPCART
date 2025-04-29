import { useState, useEffect, useContext } from 'react';
import SellerContext from '../../context/Seller/SellerContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    image: '',
    price: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { seller } = useContext(SellerContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/products'); 
        setProducts(response.data); 
      } catch (error) {
        console.error('An error occurred:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/products');
        setProducts([...products, response.data]);
        setNewProduct({ title: '', description: '', image: '', price: '' });
        toast.success('Product created successfully!');
        setEditMode(false);
    } catch (error) {
      toast.error('An error occurred while creating the product.');
      console.error('An error occurred:', error);
    }
  };

  const handleEditClick = (product) => {
    setEditMode(true);
    setSelectedProduct(product);
    setNewProduct({
        title: product.title,
        description: product.description,
        image: product.image,
        price: product.price
    });
    
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const response = await axios.put(`http://localhost:8000/api/products/${selectedProduct._id}`);
        setProducts(
          products.map((product) =>
            product._id === selectedProduct._id ? response.data : product
          )
        );
        toast.success('Product updated successfully!');
        setEditMode(false);
        setSelectedProduct(null);
        setNewProduct({ title: '', description: '', image: '', price: '' });
    } catch (error) {
      toast.error('An error occurred while updating the product.');
      console.error('An error occurred:', error);
    }
  };

  const handleDeleteClick = async (product) => {
    try {
      const response = await axios.delete(`http://localhost:8000/api/products/${product._id}`);
      console.log("delete response", response.data)
        setProducts(products.filter((p) => p._id !== product._id));
        toast.success('Product deleted successfully!');
    } catch (error) {
      toast.error('An error occurred while deleting the product.');
      console.error('An error occurred:', error);
    }
  };
  if (!seller) return <div>Loading seller data...</div>
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Product Management</h1>

      {/* Create/Edit Product Form */}
      <form onSubmit={editMode ? handleUpdateProduct : handleCreateProduct} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={newProduct.title}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={newProduct.price}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className='md:col-span-2'>
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className='md:col-span-2'>
            <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">
              Image URL
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={newProduct.image}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {editMode ? 'Update Product' : 'Create Product'}
        </button>
      </form>

      {/* Product List */}
      <h2 className="text-2xl font-bold mb-4">Your Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product._id} className="border rounded-lg p-4 shadow-md">
            <img src={product.image} alt={product.title} className="w-full h-48 object-cover mb-4 rounded-md" />
            <h2 className="text-xl font-bold mb-2">{product.title}</h2>
            <p className="text-gray-700 mb-2">{product.description}</p>
            <p className="font-semibold">Price: ${product.price}</p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => handleEditClick(product)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(product)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement;
