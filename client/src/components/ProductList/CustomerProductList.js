import React, { useEffect, useState } from "react";
import axios from "axios";
import { getBaseURL } from "../apiConfig";
import ShoppingCart from "../ShopingCart/ShoppingCart";
import "./CustomerProductList.scss";

const ProductListCustomer = (props) => {
  const [productList, setProductList] = useState([]);
  const [cartProducts, setCartProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const customerId = sessionStorage.getItem("customerId");
  const [address, setAddress] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  const fetchProducts = async (q = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`${getBaseURL()}api/products`, {
        params: q ? { q } : {},
      });
      const list = (res.data || []).map((p) => ({ ...p, quantity: 0 }));
      setProductList(list);
    } catch (e) {
      console.log("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const buildImageSrc = (imageUrl) => {
    if (!imageUrl) return null;
    const base = (getBaseURL() || "").replace(/\/$/, "");
    const path = String(imageUrl).replace(/^\//, "");
    return `${base}/${path}`;
  };

  const formatAED = (value) => {
    const n = Number(value || 0);
    // Show as "100 AED" (no decimals) per requirement
    const num = isFinite(n) ? Math.round(n) : 0;
    return `${num.toLocaleString('en-AE', { maximumFractionDigits: 0 })} AED`;
  };

  useEffect(() => {
    fetchProducts("");
    axios
      .get(`${getBaseURL()}api/cart/${customerId}`)
      .then((responseCart) => {
        let productsInCart = responseCart.data;
        setCartProducts(productsInCart);
      })
      .catch((err) => console.log("Error occurred"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cartCount = cartProducts.reduce((sum, item) => sum + (parseInt(item.quantity || 0, 10)), 0);

  const inCartQty = (productId) => {
    const found = cartProducts.find((p) => p.productId === productId);
    return found ? parseInt(found.quantity || 0, 10) : 0;
  };

  const remainingStock = (product) => {
    const total = parseInt(product.stock || 0, 10);
    const remaining = Math.max(total - inCartQty(product.productId), 0);
    return remaining;
  };

  const addToCart = (product) => {
    const remains = remainingStock(product);
    const qty = Math.min(parseInt(product.quantity || 0, 10), remains);
    if (qty > 0) {
      let updatedCartList = [...cartProducts];
      let existingProductIndex = updatedCartList.findIndex(
        (p) => p.productId === product.productId
      );

      if (existingProductIndex !== -1) {
        updatedCartList[existingProductIndex].quantity =
          updatedCartList[existingProductIndex].quantity + qty;
      } else {
        updatedCartList.push({ ...product, quantity: qty });
      }

      axios
        .post(`${getBaseURL()}api/cart/add`, {
          customerId,
          productId: product.productId,
          quantity: qty,
          isPresent: existingProductIndex !== -1,
        })
        .then(() => {
          setCartProducts(updatedCartList);
          const updatedProductList = productList.map((p) => ({
            ...p,
            quantity: 0,
          }));
          setProductList(updatedProductList);
        })
        .catch((error) => console.log("Error adding to cart:", error));
    }
  };

  const removeProduct = (productId) => {
    axios
      .delete(`${getBaseURL()}api/cart/remove/${productId}/${customerId}`)
      .then(() => {
        let updatedCartList = cartProducts.filter((product) => {
          return product.productId !== productId;
        });
        setCartProducts(updatedCartList);
      })
      .catch(() => {
        console.log("Error occurred");
      });
  };

  const updateProductQuantity = (e, productId) => {
    const updatedList = productList.map((product) => {
      if (product.productId === productId) {
        const max = remainingStock(product);
        const next = Math.max(0, Math.min(parseInt(e.target.value || 0, 10), max));
        product.quantity = next;
      }
      return product;
    });
    setProductList(updatedList);
  };

  const buyProducts = () => {
    const token = sessionStorage.getItem("jwt_token");
    if (!token) {
      alert("Authorization token is missing");
      return;
    }

    if (address !== "") {
      let customerPayload = { address };
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      setBuying(true);
      setOrderSuccess(false);
      axios
        .post(
          `${getBaseURL()}api/cart/buy/${customerId}`,
          { ...customerPayload },
          config
        )
        .then(() => {
          setCartProducts([]);
          setAddress("");
          setOrderSuccess(true);
          fetchProducts("");
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            alert("Authorization failed. Please log in again.");
          } else {
            console.error("Error:", error);
          }
        })
        .finally(() => setBuying(false));
    } else {
      alert("Please enter your address");
    }
  };

  const updateAddress = (updatedAddress) => {
    setAddress(updatedAddress);
  };

  return (
    <>
      <div className="product-list-container">
        <div className="product-list-header">
          <h1>Products</h1>
          <div className="search-bar">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or category"
            />
            <button onClick={() => fetchProducts(search)}>Search</button>
            <button
              className="secondary"
              onClick={() => {
                setSearch("");
                fetchProducts("");
              }}
            >
              Reset
            </button>
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price (AED)</th>
                <th>Category</th>
                <th>Stock</th>
                <th>No. of Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading...</td>
                </tr>
              ) : (
                productList.map((product) => (
                  <tr key={product.productId}>
                    <td>
                      {product.imageUrl ? (
                        <img
                          src={buildImageSrc(product.imageUrl)}
                          alt={product.name}
                          className="thumb"
                        />
                      ) : (
                        <span className="no-img">No image</span>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{formatAED(product.price)}</td>
                    <td>{product.category || "-"}</td>
                    <td>
                      {remainingStock(product) <= 0 || product.stockStatus === "out_of_stock"
                        ? "Out of Stock"
                        : `${remainingStock(product)} available`}
                    </td>
                    <td>
                      <input
                        type="number"
                        value={product.quantity}
                        min="0"
                        max={remainingStock(product)}
                        placeholder="Quantity"
                        disabled={product.stockStatus === "out_of_stock" || remainingStock(product) <= 0}
                        onChange={(e) =>
                          updateProductQuantity(e, product.productId)
                        }
                      />
                    </td>
                    <td>
                      {product.stockStatus === "out_of_stock" || remainingStock(product) <= 0 ? (
                        <span className="out-of-stock">Out of Stock</span>
                      ) : (
                        <button
                          disabled={product.quantity <= 0 || product.quantity > remainingStock(product)}
                          onClick={() => {
                            addToCart(product);
                          }}
                        >
                          Add to Cart
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ShoppingCart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartProducts={cartProducts}
        removeProduct={removeProduct}
        buyProducts={buyProducts}
        address={address}
        updateAddress={updateAddress}
        isBuying={buying}
        orderSuccess={orderSuccess}
      />
    </>
  );
};

export default ProductListCustomer;
 
