// app.js
const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userToken = require("./routes/userTokenRoute");
const knex = require("./database/knex");

const app = express();

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists and serve statically
const uploadsDir = path.join(__dirname, 'uploads');
try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) {}
app.use('/uploads', express.static(uploadsDir));

// Mount routes (will be available once server starts)
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/token", userToken);

const PORT = process.env.PORT || 3001;

// Ensure database schema is up-to-date before starting the server
knex.migrate
    .latest()
    .then(() => {
        console.log("Database migrations are up to date.");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to run database migrations:", err);
        process.exit(1);
    });
