const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const walletRoutes = require('./routes/wallets');
const authRoutes = require('./routes/auth');

require('dotenv').config();

console.log('Environment Variables:', {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
    FUNDER_PRIVATE_KEY: process.env.FUNDER_PRIVATE_KEY,
    FUND_AMOUNT: process.env.FUND_AMOUNT,
    NETWORK: process.env.NETWORK,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ? 'set' : 'not set'
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Swagger setup
const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yaml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/auth', authRoutes);
app.use('/wallet', walletRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
