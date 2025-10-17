const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
require('dotenv').config();

// Initialize blockchain connection
const { initBlockchain } = require('./utils/blockchain');
initBlockchain();

const connectDB = require('./dbconnect/db');
// Connect to MongoDB
connectDB();

const basicRouter = require('./router/basicRouter');
const authRoutes = require("./router/authRoutes");
const userRoutes = require('./router/userRoutes');
const loanRoutes = require('./router/loanRoutes');
const contactRoutes = require('./router/contactRoutes');
const blockchainRoutes = require('./router/blockchainRoutes');

app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Allow frontend dev server
  credentials: true,
}));

// Use the basic router for API routes
app.use('/api/v1', basicRouter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/loan', loanRoutes);
app.use('/api/v1', contactRoutes);
app.use('/api/v1/blockchain', blockchainRoutes);
app.get('/', (req, res) => {
  res.send('Welcome to the Blockchain Credit Scoring Backend Server');
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
