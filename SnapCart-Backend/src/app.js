import express from 'express'
import productRoutes from './routes/products.js'

const app = express();

app.use(express.json());

app.use(productRoutes)

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
 