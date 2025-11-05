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
  const customerId = sessionStorage.getItem("customerId");
  const [address, setAddress] = useState("");

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

  const addToCart = (product) => {
    if (product.quantity > 0) {
      let updatedCartList = [...cartProducts];
      let existingProductIndex = updatedCartList.findIndex(
        (p) => p.productId === product.productId
      );

      if (existingProductIndex !== -1) {
        updatedCartList[existingProductIndex].quantity =
          updatedCartList[existingProductIndex].quantity + product.quantity;
      } else {
        updatedCartList.push({ ...product });
      }

      axios
        .post(`${getBaseURL()}api/cart/add`, {
          customerId,
          productId: product.productId,
          quantity: product.quantity,
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
        product.quantity = parseInt(e.target.value || 0, 10);
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

      axios
        .post(
          `${getBaseURL()}api/cart/buy/${customerId}`,
          { ...customerPayload },
          config
        )
        .then(() => {
          setCartProducts([]);
          setAddress("");
          alert("Order placed successfully");
          fetchProducts("");
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            alert("Authorization failed. Please log in again.");
          } else {
            console.error("Error:", error);
          }
        });
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
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
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
                    <td>{product.name}</td>
                    <td>{product.price}</td>
                    <td>{product.category || "-"}</td>
                    <td>
                      {product.stockStatus === "out_of_stock"
                        ? "Out of Stock"
                        : "In Stock"}
                    </td>
                    <td>
                      <input
                        type="number"
                        value={product.quantity}
                        min="0"
                        placeholder="Quantity"
                        disabled={product.stockStatus === "out_of_stock"}
                        onChange={(e) =>
                          updateProductQuantity(e, product.productId)
                        }
                      />
                    </td>
                    <td>
                      {product.stockStatus === "out_of_stock" ? (
                        <span className="out-of-stock">Out of Stock</span>
                      ) : (
                        <button
                          disabled={product.quantity <= 0}
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
        cartProducts={cartProducts}
        removeProduct={removeProduct}
        buyProducts={buyProducts}
        address={props.address}
        updateAddress={updateAddress}
      />
    </>
  );
};

export default ProductListCustomer;
 
