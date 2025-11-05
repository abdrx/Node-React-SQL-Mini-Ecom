import React, { useState, useEffect } from "react";
import axios from "axios";
import { getBaseURL } from "../apiConfig";
import "./AdminProductList.scss";

const ProductList = (props) => {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [productDesc, setProductDesc] = useState("");
  const [productStock, setProductStock] = useState(0);
  const [productCategory, setProductCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, name: '', price: '', stock: '', category: '', description: '', imageFile: null, imageUrl: '' });

  const addProduct = async (e) => {
    e?.preventDefault();
    setError("");
    const name = productName;
    const price = parseFloat(productPrice);
    const description = productDesc;
    const stock = parseInt(productStock || 0, 10);
    const category = productCategory || "";
    if (!name || !price || !description) {
      setError("Name, Price and Description are required");
      return;
    }
    try {
      const createRes = await axios.post(`${getBaseURL()}api/products`, { name, price, description, stock, category });
      const insertId = createRes?.data?.insertId || createRes?.data?.[0]?.insertId;
      if (insertId && imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        await axios.post(`${getBaseURL()}api/products/${insertId}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowAdd(false);
      setProductName("");
      setProductPrice(0);
      setProductDesc("");
      setProductStock(0);
      setProductCategory("");
      setImageFile(null);
      fetchProducts();
    } catch (err) {
      setError("Failed to add product");
    }
  };

  const openEdit = (p) => {
    setEditForm({ id: p.productId, name: p.name || '', price: p.price || '', stock: p.stock || 0, category: p.category || '', description: p.description || '', imageFile: null, imageUrl: p.imageUrl || '' });
    setShowEdit(true);
  };

  const saveEdit = async (e) => {
    e?.preventDefault();
    const { id, name, price, stock, category, description, imageFile } = editForm;
    if (!id || !name || !price) return;
    try {
      await axios.post(`${getBaseURL()}api/products/update`, { id, name, price, stock, category, description });
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        await axios.post(`${getBaseURL()}api/products/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowEdit(false);
      fetchProducts();
    } catch (_) {}
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openProductDetails = (product) => {
    props.handleProductDetails(product);
  };

  const deleteProduct = (productId) => {
    axios
      .delete(`${getBaseURL()}api/products/delete/${productId}`)
      .then((res) => {
        console.log("Deletion successful");
        fetchProducts();
      })
      .catch((err) => console.log("Error"));
  };

  const fetchProducts = () => {
    axios
      .get(`${getBaseURL()}api/products`)
      .then((res) => {
        const data = res.data;
        setProducts(data);
      })
      .catch((err) => console.log("Couldn't receive list"));
  };

  const buildImageSrc = (imageUrl) => {
    if (!imageUrl) return null;
    const base = (getBaseURL() || "").replace(/\/$/, "");
    const path = String(imageUrl).replace(/^\//, "");
    return `${base}/${path}`;
  };

  const formatAED = (value) => {
    const n = Number(value || 0);
    const num = isFinite(n) ? Math.round(n) : 0;
    return `${num.toLocaleString('en-AE', { maximumFractionDigits: 0 })} AED`;
  };

  return (
    <div className="product-list-container">
      <div className="product-list-header-row">
        <h1>Product List</h1>
        <button className="btn" onClick={() => setShowAdd(true)}>Add Product</button>
      </div>
      <div className="product-list">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Id</th>
              <th>Name</th>
                <th>Price (AED)</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Details</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              return (
                <tr key={product.productId}>
                  <td>
                    {product.imageUrl ? (
                      <img src={buildImageSrc(product.imageUrl)} alt={product.name} className="thumb" />
                    ) : (
                      <span className="no-img">No image</span>
                    )}
                  </td>
                  <td>{product.productId}</td>
                  <td>{product.name}</td>
                  <td>{formatAED(product.price)}</td>
                  <td>{product.stock ?? 0}</td>
                  <td>{product.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'In Stock'}</td>
                  <td>{product.createdDate}</td>
                  <td>
                    <button
                      onClick={() => {
                        openProductDetails(product);
                      }}
                    >
                      Details
                    </button>
                  </td>
                  <td>
                    <button onClick={() => openEdit(product)}>Edit</button>
                  </td>
                  <td>
                    <button onClick={() => deleteProduct(product.productId)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="admin-modal" onClick={() => setShowAdd(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Add Product</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={addProduct} className="modal-form">
              <label htmlFor="productName">Product Name:</label>
              <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product Name" />
              <label htmlFor="productPrice">Price:</label>
              <input type="number" id="productPrice" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="Price" />
              <label htmlFor="productStock">Stock:</label>
              <input type="number" id="productStock" value={productStock} min="0" onChange={(e) => setProductStock(e.target.value)} placeholder="Stock" />
              <label htmlFor="productCategory">Category:</label>
              <input type="text" id="productCategory" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} placeholder="Category" />
              
              <label htmlFor="productDesc">Description:</label>
              <input type="text" id="productDesc" value={productDesc} onChange={(e) => setProductDesc(e.target.value)} placeholder="Description" />
              <label htmlFor="productImage">Image:</label>
              <input type="file" id="productImage" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              <div className="modal-actions">
                <button type="button" className="btn secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEdit && (
        <div className="admin-modal" onClick={() => setShowEdit(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Product</h2>
            <form onSubmit={saveEdit} className="modal-form">
              <label>Name</label>
              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <label>Price</label>
              <input type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
              <label>Stock</label>
              <input type="number" min="0" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} />
              <label>Category</label>
              <input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
              <label>Description</label>
              <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              <label>Image</label>
              <input type="file" accept="image/*" onChange={(e) => setEditForm({ ...editForm, imageFile: e.target.files?.[0] || null })} />
              {editForm.imageUrl && (
                <img src={buildImageSrc(editForm.imageUrl)} alt={editForm.name} className="thumb" />
              )}
              <div className="modal-actions">
                <button type="button" className="btn secondary" onClick={() => setShowEdit(false)}>Cancel</button>
                <button type="submit" className="btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
