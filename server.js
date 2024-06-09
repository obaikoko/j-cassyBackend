import path from 'path';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import products from './data/products.js';
import dotenv from 'dotenv';
import colors from 'colors';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import userRoute from './routes/userRoutes.js';
import productRoute from './routes/productRoutes.js';
import orderRoute from './routes/orderRoutes.js';

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();
const app = express();
const corsOptions = {
  // origin: 'http://localhost:3000',
  origin: 'http://jcassy.vercel.app',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/users', userRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use(notFound);
app.use(errorHandler);
app.listen(port, () => console.log(`Server running on ${port}`));
