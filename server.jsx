const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Routes
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/users', require('./routes/users'));

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
