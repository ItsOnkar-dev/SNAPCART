import express from 'express'
import productRoutes from './Routes/products.js'
import cors from 'cors'

const app = express();

app.use(cors()) // Enable CORS for all requests
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use('/api', productRoutes) // Add product routes

// Global Express Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Internal Server Error' } = err;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
})

export default app
 