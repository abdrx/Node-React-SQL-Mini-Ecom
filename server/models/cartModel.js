// cartModel.js

const pool = require("../database/connection");

exports.getShoppingCart = (userId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT S.quantity, P.name, P.price, P.productId FROM shopingCart S INNER JOIN product P ON S.productId = P.productId WHERE S.userId = ?",
            [userId],
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

exports.addToCart = (customerId, productId, quantity, isPresent) => {
    return new Promise((resolve, reject) => {
        if (isPresent) {
            pool.query(
                "UPDATE shopingCart SET quantity = quantity + ? WHERE productId = ? AND userId = ?",
                [quantity, productId, customerId],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        } else {
            pool.query(
                "INSERT INTO shopingCart (userId, productId, quantity) VALUES (?, ?, ?)",
                [customerId, productId, quantity],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        }
    });
};

exports.removeFromCart = (productId, userId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "DELETE FROM shopingCart WHERE productId = ? AND userId = ?",
            [productId, userId],
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

exports.buy = (customerId, address) => {
    return new Promise((resolve, reject) => {
        // Start transaction
        pool.beginTransaction((err) => {
            if (err) return reject(err);

            // Check stock availability
            const checkSql =
              "SELECT S.productId, S.quantity, P.stock FROM shopingCart S JOIN product P ON P.productId = S.productId WHERE S.userId = ? AND S.quantity > P.stock";
            pool.query(checkSql, [customerId], (err, insufficient) => {
                if (err) {
                    return pool.rollback(() => reject(err));
                }
                if (insufficient.length > 0) {
                    return pool.rollback(() => reject(new Error('Insufficient stock for one or more items')));
                }

                // Create order
                pool.query(
                    "INSERT INTO orders (userId, address) VALUES (?, ?);",
                    [customerId, address],
                    (err, orderResult) => {
                        if (err) {
                            return pool.rollback(() => reject(err));
                        }

                        // Move items into productsInOrder
                        const pioSql =
                          "INSERT INTO productsInOrder (orderId, productId, quantity, totalPrice) " +
                          "SELECT (SELECT max(orderId) FROM orders WHERE userId = ?), S.productId, S.quantity, P.price * S.quantity " +
                          "FROM shopingCart S INNER JOIN product P ON S.productId = P.productId WHERE S.userId = ?;";
                        pool.query(pioSql, [customerId, customerId], (err, productsResult) => {
                            if (err) {
                                return pool.rollback(() => reject(err));
                            }

                            // Decrement stock and set stockStatus
                            const decSql =
                              "UPDATE product P JOIN shopingCart S ON S.productId = P.productId " +
                              "SET P.stock = GREATEST(P.stock - S.quantity, 0), " +
                              "P.stockStatus = CASE WHEN (P.stock - S.quantity) <= 0 THEN 'out_of_stock' ELSE 'in_stock' END " +
                              "WHERE S.userId = ?;";
                            pool.query(decSql, [customerId], (err, decRes) => {
                                if (err) {
                                    return pool.rollback(() => reject(err));
                                }

                                // Update total price
                                const totalSql =
                                  "UPDATE orders O SET totalPrice = (SELECT SUM(P.totalPrice) FROM productsInOrder P WHERE O.orderId = P.orderId GROUP BY O.orderId) WHERE userId = ? AND totalPrice IS NULL;";
                                pool.query(totalSql, customerId, (err, totalPriceResult) => {
                                    if (err) {
                                        return pool.rollback(() => reject(err));
                                    }

                                    // Clear cart
                                    pool.query("DELETE FROM shopingCart WHERE userId = ?;", customerId, (err, clearCartResult) => {
                                        if (err) {
                                            return pool.rollback(() => reject(err));
                                        }

                                        pool.commit((err) => {
                                            if (err) {
                                                return pool.rollback(() => reject(err));
                                            }
                                            resolve({ orderResult, productsResult, totalPriceResult, clearCartResult });
                                        });
                                    });
                                });
                            });
                        });
                    }
                );
            });
        });
    });
};
