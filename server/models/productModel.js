// productModel.js

const pool = require("../database/connection");

exports.getAllProducts = ({ q, category, stockStatus } = {}) => {
    return new Promise((resolve, reject) => {
        let query = "SELECT * FROM product";
        const where = [];
        const params = [];

        if (q) {
            where.push("(name LIKE ? OR category LIKE ?)");
            params.push(`%${q}%`, `%${q}%`);
        }
        if (category) {
            where.push("category = ?");
            params.push(category);
        }
        if (stockStatus) {
            where.push("stockStatus = ?");
            params.push(stockStatus);
        }
        if (where.length) {
            query += " WHERE " + where.join(" AND ");
        }
        query += ";";

        pool.query(query, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};


exports.getProductDetailsById = (productId) => {
    return new Promise((resolve, reject) => {
        const query =
            "SELECT * FROM product WHERE productId = ?";
        pool.query(query, [productId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

exports.allOrderByProductId = (productId) => {
    return new Promise((resolve, reject) => {
        const query =
            "SELECT O.orderId, U.fname, U.lname, O.createdDate, PIN.quantity, PIN.totalPrice " +
            "FROM users U INNER JOIN orders O on U.userId  = O.userId " +
            "INNER JOIN productsInOrder PIN on O.orderId = PIN.orderId " +
            "INNER JOIN product P on PIN.productId = P.productId " +
            "WHERE PIN.productId = ?;";

        pool.query(query, [productId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};


exports.createProduct = (name, price, description, category, stockStatus = 'in_stock', stock = 0, imageUrl = null) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "INSERT INTO product (name, price, description, category, stockStatus, stock, imageUrl) VALUES (?,?,?,?,?,?,?);",
            [name, price, description, category || null, stockStatus, stock || 0, imageUrl || null],
            (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

exports.updateProduct = (productId, name, price, description, category, stockStatus, stock, imageUrl) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "UPDATE product SET name = ?, price = ?, description = ?, category = ?, stockStatus = ?, stock = COALESCE(?, stock), imageUrl = COALESCE(?, imageUrl) WHERE productId = ?",
            [name, price, description, category || null, stockStatus || 'in_stock', stock, imageUrl, productId],
            (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

exports.deleteProduct = (productId) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM product WHERE productId = ?", [productId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Update only stock and derive stockStatus
exports.updateStock = (productId, stock) => {
    return new Promise((resolve, reject) => {
        const s = Math.max(parseInt(stock || 0, 10), 0);
        pool.query(
            "UPDATE product SET stock = ?, stockStatus = CASE WHEN ? <= 0 THEN 'out_of_stock' ELSE 'in_stock' END WHERE productId = ?",
            [s, s, productId],
            (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

// Update only image URL for a product
exports.updateProductImage = (productId, imageUrl) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "UPDATE product SET imageUrl = ? WHERE productId = ?",
            [imageUrl, productId],
            (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
};
