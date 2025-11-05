import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { getBaseURL } from '../apiConfig';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import './MiniEcomProducts.scss';

const emptyForm = { name: '', price: '', category: '', stockStatus: 'in_stock', stock: '', description: '', imageFile: null, imageUrl: '' };

const MiniEcomProducts = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${getBaseURL()}api/products`, { params: q ? { q } : {} });
      setProducts(res.data || []);
    } catch (e) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts('');
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.price) {
      setError('Name and Price are required');
      return;
    }
    try {
      const createRes = await axios.post(`${getBaseURL()}api/products`, {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description || '',
        category: form.category || '',
        stockStatus: form.stockStatus || 'in_stock',
        stock: form.stock ? parseInt(form.stock, 10) : 0,
        imageUrl: form.imageUrl || undefined,
      });

      // If we have a file, upload it
      if (form.imageFile) {
        const insertId = createRes?.data?.insertId || createRes?.data?.[0]?.insertId;
        if (insertId) {
          const fd = new FormData();
          fd.append('image', form.imageFile);
          await axios.post(`${getBaseURL()}api/products/${insertId}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
      }

      setForm(emptyForm);
      setShowAdd(false);
      fetchProducts(query);
    } catch (e) {
      setError('Failed to add product');
    }
  };

  const filtered = useMemo(() => {
    if (!query) return products;
    const q = query.toLowerCase();
    return products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div className="me-page">
      <Header />

      <main className="me-container">
        <section className="me-controls">
          <input
            className="me-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or category"
          />
          <button className="me-btn" onClick={() => fetchProducts(query)}>Search</button>
          <button className="me-btn me-secondary" onClick={() => { setQuery(''); fetchProducts(''); }}>Reset</button>
          <div style={{flex:1}} />
          <button className="me-btn" onClick={() => { setForm(emptyForm); setError(''); setShowAdd(true); }}>Add Product</button>
        </section>

        <section className="me-grid">
          <div className="me-card">
            <h2 className="me-card-title">Products</h2>
            {loading ? (
              <div>Loading…</div>
            ) : (
              <div className="me-table-wrap">
                <table className="me-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Image</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.productId} onClick={() => setSelected(p)} style={{cursor:'pointer'}}>
                        <td>{p.name}</td>
                        <td>{p.price}</td>
                        <td>{p.category || '-'}</td>
                        <td>{p.stock ?? '-'}</td>
                        <td>{p.imageUrl ? <img alt="" src={`${getBaseURL().replace(/\/$/, '')}${p.imageUrl}`} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} /> : '-'}</td>
                        <td>{p.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'In Stock'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {showAdd && (
          <div className="me-modal" onClick={() => setShowAdd(false)}>
            <div className="me-modal-card" onClick={(e) => e.stopPropagation()}>
              <h2 className="me-card-title">Add Product</h2>
              {error && <div className="me-error">{error}</div>}
              <form onSubmit={onSubmit} className="me-form">
                <label>
                  <span>Name</span>
                  <input className="me-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </label>
                <label>
                  <span>Price</span>
                  <input className="me-input" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </label>
                <label>
                  <span>Category</span>
                  <input className="me-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                </label>
                <label>
                  <span>Stock</span>
                  <input className="me-input" type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </label>
                <label>
                  <span>Stock Status</span>
                  <select className="me-input" value={form.stockStatus} onChange={e => setForm({ ...form, stockStatus: e.target.value })}>
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </label>
                <label>
                  <span>Image</span>
                  <input className="me-input" type="file" accept="image/*" onChange={e => setForm({ ...form, imageFile: e.target.files?.[0] || null })} />
                </label>
                <label>
                  <span>Image URL (optional)</span>
                  <input className="me-input" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
                </label>
                <label>
                  <span>Description</span>
                  <textarea className="me-input" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </label>
                <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
                  <button type="button" className="me-btn me-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button className="me-btn" type="submit">Add</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selected && (
          <div className="me-modal" onClick={() => setSelected(null)}>
            <div className="me-modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 style={{marginTop:0}}>{selected.name}</h3>
              {selected.imageUrl && (
                <img alt="" src={`${getBaseURL().replace(/\/$/, '')}${selected.imageUrl}`} style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 6 }} />
              )}
              <p><strong>Price:</strong> {selected.price}</p>
              <p><strong>Category:</strong> {selected.category || '-'}</p>
              <p><strong>Stock:</strong> {selected.stock ?? '-'}</p>
              <p><strong>Status:</strong> {selected.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'In Stock'}</p>
              <p style={{whiteSpace:'pre-wrap'}}>{selected.description}</p>
              <div style={{textAlign:'right'}}>
                <button className="me-btn" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MiniEcomProducts;
