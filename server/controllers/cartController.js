// cartController.js

const cartModel = require("../models/cartModel");
const { verifyToken } = require('../utils/token'); 


exports.getShoppingCart = (req, res) => {
    const userId = req.params.userId;
    cartModel.getShoppingCart(userId)
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).send("Error fetching shopping cart.");
        });
};

exports.addToCart = (req, res) => {
    const { customerId, productId, quantity, isPresent } = req.body;
    cartModel.addToCart(customerId, productId, quantity, isPresent)
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).send("Error adding product to cart.");
        });
};

exports.removeFromCart = (req, res) => {
    const productId = req.params.productId;
    const userId = req.params.userId;
    cartModel.removeFromCart(productId, userId)
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).send("Error removing product from cart.");
        });
};


exports.buy = (req, res) => {
    // Extract JWT token from the request headers
    const token = req.headers.authorization;

    // Check if token is present and properly formatted
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized: Missing or invalid token');
    }

    // Extract the token from the header
    const tokenValue = token.split(' ')[1];

    // Verify the token
    verifyToken(tokenValue)
        .then(decoded => {
            // Token is valid, proceed with cartModel.buy function
            const customerId = req.params.id;
            const address = req.body.address;

            cartModel.buy(customerId, address)
                .then(result => {
                    res.send(result);
                })
                .catch(err => {
                    const msg = (err && err.message) || String(err);
                    if (msg && msg.toLowerCase().includes('insufficient stock')) {
                        return res.status(409).json({ error: 'INSUFFICIENT_STOCK', message: 'Insufficient stock for one or more items' });
                    }
                    console.error('Buy failed:', msg);
                    res.status(500).json({ error: 'BUY_FAILED' });
                });
        })
        .catch(err => {
            // Token verification failed
            if (err && err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'TOKEN_EXPIRED' });
            }
            console.error('Token verification failed:', err && err.message ? err.message : err);
            return res.status(401).json({ error: 'UNAUTHORIZED' });
        });
};
