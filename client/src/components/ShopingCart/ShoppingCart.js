import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getBaseURL } from "../apiConfig";
import "./ShoppingCart.scss"; // Import the CSS file

const ShoppingCart = (props) => {
  const [cartProducts, setCartProducts] = useState(props.cartProducts);
  const customerId = sessionStorage.getItem("customerId");

  useEffect(() => {
    axios
      .get(`${getBaseURL()}api/cart/${customerId}`)
      .then((res) => {
        let productsInCart = res.data;
        setCartProducts(productsInCart);
      })
      .catch((err) => console.log("Error occurred"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.cartProducts]);

  const buyProducts = () => {
    if (!props.isBuying) props.buyProducts();
  };

  const formatAED = (value) => {
    const n = Number(value || 0);
    const num = isFinite(n) ? Math.round(n) : 0;
    return `${num.toLocaleString('en-AE', { maximumFractionDigits: 0 })} AED`;
  };

  const subtotal = useMemo(() => {
    return (cartProducts || []).reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0);
  }, [cartProducts]);
  const total = subtotal; // no extra fees for now

  return (
    <>
      <div className={`cart-overlay ${props.open ? 'visible' : ''}`} onClick={() => !props.isBuying && props.onClose && props.onClose()} />
      <aside className={`cart-drawer ${props.open ? 'open' : ''}`} aria-hidden={!props.open}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="icon-btn" onClick={() => !props.isBuying && props.onClose && props.onClose()} aria-label="Close cart">×</button>
        </div>

        {props.orderSuccess && (
          <div className="order-success">Order placed successfully.</div>
        )}

        {cartProducts?.length > 0 ? (
          <>
            <div className="cart-body">
              <table className="shopping-cart-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Qty</th>
                    <th>Line Total</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cartProducts.map((product) => (
                    <tr key={product.productId}>
                      <td>{product.name}</td>
                      <td>{product.quantity}</td>
                      <td>{formatAED(Number(product.price) * Number(product.quantity))}</td>
                      <td>
                        <button
                          onClick={() => !props.isBuying && props.removeProduct(product.productId)}
                          disabled={props.isBuying}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="cart-totals">
                <div className="row">
                  <span>Subtotal</span>
                  <strong>{formatAED(subtotal)}</strong>
                </div>
                <div className="row total">
                  <span>Total</span>
                  <strong>{formatAED(total)}</strong>
                </div>
              </div>

              <div className="payment-section">
                <div className="section-title">Payment</div>
                <label className="radio">
                  <input type="radio" name="payment" checked readOnly />
                  <span>Pay with cash (Cash on Delivery)</span>
                </label>
              </div>

              <div className="address-container">
                <input
                  type="text"
                  className="address-input"
                  placeholder="Delivery Address"
                  value={props.address}
                  onChange={(e) => props.updateAddress(e.target.value)}
                  disabled={props.isBuying}
                />
                <button className="buy-button" onClick={buyProducts} disabled={props.isBuying}>
                  {props.isBuying ? 'Placing order…' : 'Buy'}
                </button>
              </div>
            </div>

            {props.isBuying && (
              <div className="drawer-loading">
                <div className="spinner" aria-label="Loading" />
              </div>
            )}
          </>
        ) : (
          <div className="empty-cart">Your cart is empty.</div>
        )}
      </aside>
    </>
  );
};

export default ShoppingCart;
