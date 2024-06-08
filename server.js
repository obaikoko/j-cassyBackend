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
import uploadRoute from './routes/uploadRoutes.js';

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();
const app = express();
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/users', userRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

if (process.env.NODE_ENV === 'production') {
  app.use('/uploads', express.static('/var/data/uploads'));
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.use('/api/upload', uploadRoute);
app.use(errorHandler);
app.use(notFound);
app.listen(port, () => console.log(`Server running on ${port}`));
