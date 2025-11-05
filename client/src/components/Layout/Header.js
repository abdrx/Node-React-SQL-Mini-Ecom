import React from 'react';
import './Layout.scss';

const Header = ({ isAuthenticated, onLogout }) => (
  <header className="me-header">
    <div className="me-container me-header-row">
      <h1 className="me-logo">Mini Ecom developed by abdul</h1>
      <div className="me-header-actions">
        {isAuthenticated && (
          <button className="me-btn me-secondary" onClick={onLogout}>Logout</button>
        )}
      </div>
    </div>
  </header>
);

export default Header;
