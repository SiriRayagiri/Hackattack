const express = require('express');
const router = express.Router();
const axios = require('axios');
const nodemailer = require('nodemailer');

// Mock Data for Stocks
let stocks = [];

// Function to fetch stock data from an external API
const fetchStockData = async (symbol) => {
    const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
            function: 'TIME_SERIES_INTRADAY',
            symbol: symbol,
            interval: '1min',
            apikey: process.env.ALPHA_VANTAGE_API_KEY
        }
    });
    return response.data;
};

// Add stock to portfolio
router.post('/add', (req, res) => {
    const { symbol, quantity, purchasePrice, purchaseDate, alertPrice, alertType } = req.body;
    const stock = { symbol, quantity, purchasePrice, purchaseDate, alertPrice, alertType };
    stocks.push(stock);
    res.json(stock);
});

// Get user's portfolio
router.get('/', (req, res) => {
    res.json(stocks);
});

// Set up a price alert
router.post('/alert', (req, res) => {
    const { symbol, alertPrice, alertType, email } = req.body;
    const stock = stocks.find(stock => stock.symbol === symbol);
    if (stock) {
        stock.alertPrice = alertPrice;
        stock.alertType = alertType;

        // Set up a check for the price alert
        setInterval(async () => {
            const data = await fetchStockData(symbol);
            const latestPrice = parseFloat(data['Time Series (1min)'][Object.keys(data['Time Series (1min)'])[0]]['4. close']);
            if ((alertType === 'above' && latestPrice >= alertPrice) || (alertType === 'below' && latestPrice <= alertPrice)) {
                // Send email notification
                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Stock Price Alert',
                    text: `The stock ${symbol} has reached your alert price of ${alertPrice}. Current price: ${latestPrice}`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
        }, 60000); // Check every minute

        res.json({ message: 'Alert set successfully' });
    } else {
        res.status(404).json({ error: 'Stock not found' });
    }
});

module.exports = router;
