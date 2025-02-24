const express = require('express');
const mongoose = require('mongoose')
const PORT = 8000;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/products')

app.use(express.json());

let products = [
    {   
        id: 1,
        title: "Iphone",
        price: 200,
        description: "The initial purpose of this code was for digital payment systems, however this status code is rarely used and no standard convention exists.",
        image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aXBob25lfGVufDB8fDB8fHww"
    },
    {
        id: 2,
        title: "Macbook",
        price: 100,
        description: "The initial purpose of this code was for digital payment systems, however this status code is rarely used and no standard convention exists.",
        image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aXBob25lfGVufDB8fDB8fHww"
    },
    {
        id: 3,
        title: "Apple Watch",
        price: 400,
        description: "The initial purpose of this code was for digital payment systems, however this status code is rarely used and no standard convention exists.",
        image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aXBob25lfGVufDB8fDB8fHww"
    }
]


// Get All products
app.get('/products', (req, res) => {
    res.status(200).json(products);
});


// Creating the new Product
app.post('/products', (req, res) => {
    const { title, description, image, price } = req.body;
    const newProduct = products.push({ id: products.length + 1, title, description, image, price });

    if (!newProduct) return res.status(500).json({ status: 'error', message: 'Failed to create user' });

    res.status(201).json({status: 'success', message: 'Product created successfully' });
});

app.route('/products/:productId')
// Show a product
.get((req, res) => {
    const { productId } = req.params;
    const product = products.find((product) => product.id === parseInt(productId));

    if (!product) return res.status(404).json({ status: 'error', message: 'User not found' });

    res.status(200).json(product);
})
// Update a product
.patch((req, res) => {
    const { productId } = req.params;
    const { title, description, image, price } = req.body;
    const product = products.find((product) => product.id === parseInt(productId));

    if (!product) {
        return res.status(500).json({ status: 'error', message: 'Failed to update user' });
    }
    
    product.title = title;
    product.price = price;
    product.description = description;
    product.image = image;

    res.status(200).json({status: 'success', message: 'product updated successfully' });
});

// Delete a product
app.delete('/products/:productId', (req, res) => {
    const { productId } = req.params;
    // Check if product exists
    const originalLength = products.length;
    products = products.filter((product) => product.id !== parseInt(productId));
    // If length hasn't changed, product wasn't found
    if (products.length === originalLength) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.status(200).json({status: 'success', message: 'product deleted successfully' });
})

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
 