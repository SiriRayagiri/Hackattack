const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Mock Data for Users
let users = [];

// Register user
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const user = { name, email, password };
    users.push(user);
    res.json(user);
});

// Login user
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        const token = jwt.sign({ userId: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(400).json({ error: 'Invalid credentials' });
    }
});

module.exports = router;

