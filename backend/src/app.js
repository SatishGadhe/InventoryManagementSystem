const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/sequelize');
const connectMongo = require('./config/mongoose');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


// Error handler middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.sync({force:true});
    await connectMongo();

    const orderRoutes = require('./routes/orders');
    const productRoutes = require('./routes/products');
    const supplierRoutes = require('./routes/suppliers');
    const dashboardRoutes=require('./routes/dashboard')

    app.use('/api/orders', orderRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/suppliers', supplierRoutes);
    app.use('/api/dashboard',dashboardRoutes);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer(); 