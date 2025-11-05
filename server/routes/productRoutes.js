// productRoutes.js

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const multer = require('multer');
const path = require('path');

// Multer storage for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

// Route to get all products
router.get("/", productController.getAllProducts);

// Route to get all orders product details by ID (must be before ":id")
router.get("/allOrderByProductId/:id", productController.allOrderByProductId);

// Route to get product details by ID
router.get("/:id", productController.getProductDetailsById);

// Route to create a new product
router.post("/create", productController.createProduct);

// Alias: POST /api/products (assignment requirement)
router.post("/", productController.createProduct);

// Route to update an existing product
router.post("/update", productController.updateProduct);

// Route to update only stock
router.post("/stock", productController.updateStock);

// Route to delete a product by ID
router.delete("/delete/:id", productController.deleteProduct);

// Upload product image (support both "/:id/image" and "/image/:id")
router.post("/:id/image", upload.single('image'), productController.setProductImage);
router.post("/image/:id", upload.single('image'), productController.setProductImage);

module.exports = router;
