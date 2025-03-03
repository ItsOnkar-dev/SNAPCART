import express from 'express'
import productRoutes from './routes/products.js'

const app = express();

app.use(express.json());

app.use(productRoutes)

export default app
 