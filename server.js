const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv').config();
const port = process.env.PORT || 5000;
const colors = require('colors');
const cors = require('cors')
const { errorHandler } = require('./middleware/errorMiddleware');

connectDB();
const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use(errorHandler);
app.listen(port, () => console.log(`Server running on port ${port}`));
