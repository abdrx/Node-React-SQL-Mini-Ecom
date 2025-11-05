// productController.js

const productModel = require("../models/productModel");

exports.getAllProducts = (req, res) => {
    const { q, category, stockStatus } = req.query;
    productModel.getAllProducts({ q, category, stockStatus })
        .then(products => {
            res.json(products);
        })
        .catch(error => {
            console.error("Error fetching products:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
};


exports.getProductDetailsById = (req, res) => {
    const productId = req.params.id;
    productModel.getProductDetailsById(productId)
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).send("Error fetching product.");
        });
};

exports.allOrderByProductId = (req, res) => {
    const productId = req.params.id;
    productModel.allOrderByProductId(productId)
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).send("Error fetching product.");
        });
};

exports.createProduct = (req, res) => {
    let { name, price, description, category, stockStatus, stock, imageUrl } = req.body;
    // Default stock status based on stock count if not provided
    if (!stockStatus) {
        const n = parseInt(stock, 10) || 0;
        stockStatus = n > 0 ? 'in_stock' : 'out_of_stock';
    }
    productModel.createProduct(name, price, description, category, stockStatus, stock, imageUrl)
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).send("Error creating product.");
        });
};

exports.updateProduct = (req, res) => {
    let { id, name, price, description, category, stockStatus, stock, imageUrl } = req.body;
    // If stock provided but no stockStatus, derive automatically
    if ((stock !== undefined && stock !== null) && (stockStatus === undefined || stockStatus === null)) {
        const s = parseInt(stock, 10) || 0;
        stockStatus = s > 0 ? 'in_stock' : 'out_of_stock';
    }
    productModel.updateProduct(id, name, price, description, category, stockStatus, stock, imageUrl)
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).send("Error updating product.");
        });
};

// Image upload handler will be bound via multer in route
exports.setProductImage = (req, res) => {
    const productId = req.params.id;
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }
    const relativePath = `/uploads/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${relativePath}`;
    productModel.updateProductImage(productId, relativePath)
        .then(() => res.json({ imageUrl: relativePath, imageFullUrl: fullUrl }))
        .catch((err) => {
            console.error('Failed to update imageUrl:', err);
            res.status(500).json({ error: 'Failed to save image URL' });
        });
};

exports.deleteProduct = (req, res) => {
    const productId = req.params.id;
    productModel.deleteProduct(productId)
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).send("Error deleting product.");
        });
};

exports.updateStock = (req, res) => {
    const { id, stock } = req.body;
    if (id == null || stock == null) {
        return res.status(400).json({ error: 'id and stock are required' });
    }
    productModel.updateStock(id, stock)
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).send('Error updating stock.');
        });
};
