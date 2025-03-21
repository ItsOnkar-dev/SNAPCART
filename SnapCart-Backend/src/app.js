import express from 'express'
import productRoutes from './Routes/products.js'
import userRoutes from './Routes/user.js'
import cors from 'cors'

const app = express();

app.use(cors()) // Enable CORS for all requests
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use('/api', productRoutes) // Add product routes
app.use(userRoutes)  // Add user routes

// Global Express Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Internal Server Error' } = err;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    errMsg: message
  });
})

export default app
 