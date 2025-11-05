// database/connection.js
const mysql2 = require("mysql2");
require('dotenv').config(); // Load environment variables from .env file

let connectionParams;

// Toggle between localhost and server configurations. Default to localhost for XAMPP.
const useLocalhost = (process.env.USE_LOCALHOST ?? 'true') === 'true';

if (useLocalhost) {
    console.log("DB: using local XAMPP settings");
    connectionParams = {
        host: "localhost",
        user: "root",
        // XAMPP default root password is empty string. Change here if you've set a password.
        password: "",
        database: "miniecom",
    };
} else {
    connectionParams = {
        host: process.env.DB_SERVER_HOST,
        user: process.env.DB_SERVER_USER,
        password: process.env.DB_SERVER_PASSWORD,
        database: process.env.DB_SERVER_DATABASE,
    };
}

const pool = mysql2.createConnection(connectionParams);

pool.connect((err) => {
    if (err) console.error("DB connection error:", err.message);
    else console.log("DB Connection Done");
});

module.exports = pool;

