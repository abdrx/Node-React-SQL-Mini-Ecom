# Mini eCommerce – Product Listing Module

This repo contains a simple, working mini eCommerce module with a React front‑end and a Node.js/Express back‑end using MySQL. It matches the assignment exactly and includes a clean UI, product CRUD, and an AWS deployment guide.

---

## Quick Start (Local)

Prerequisites
- Node.js LTS + npm
- MySQL (XAMPP or native)

1) Create database (MySQL)
- Name: `miniecom`
- User: `root` (password empty) if you use XAMPP defaults

CLI
```sql
CREATE DATABASE miniecom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
phpMyAdmin
1. Go to http://localhost/phpmyadmin → Databases → Create `miniecom` (utf8mb4_unicode_ci)

2) Backend config (server/.env)
```env
USE_LOCALHOST=true

# JWT secrets (use long, random values)
JWT_SECRET_KEY_ACCESS_TOKEN=replace_with_random
JWT_SECRET_KEY_REFRESH_TOKEN=replace_with_random

# For non-local DBs set USE_LOCALHOST=false and provide:
# DB_SERVER_HOST=your-mysql-host
# DB_SERVER_USER=your-user
# DB_SERVER_PASSWORD=your-password
# DB_SERVER_DATABASE=miniecom
```

3) Install deps
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

4) Run DB migrations (optional but recommended)
```bash
cd server
npm run migrate
```
This creates/updates tables and fields: users, product, orders, shopingCart, productsInOrder, plus product.category, product.stockStatus, product.stock, product.imageUrl.

5) Start services
```bash
# Backend (port 3001 by default)
cd server && npm run start

# Frontend (http://localhost:3000)
cd client && npm start
```
API: http://localhost:3001/
Images: http://localhost:3001/uploads/

If 3001 is busy:
```bash
lsof -n -iTCP:3001 -sTCP:LISTEN -P
kill -9 <PID>
```

Optional client config: `client/.env`
```env
REACT_APP_API_URL=http://localhost:3001/
```

---

## What’s Included (Assignment Mapping)

Front‑end
- Product list shows: Name, Price, Category, Stock Status
- Add Product form (name, price, category, stock status, optional description, image)
- Clean responsive UI (React + SCSS)

Back‑end
- GET /api/products → Fetch all products
- POST /api/products → Add new product (alias of /api/products/create)
- SQL storage (MySQL)
- Image upload saved locally and served at /uploads

Database
- MySQL table product includes: productId, name, description, price, category, stockStatus, stock, imageUrl, createdDate

Cloud / AWS (documented)
- EC2 for API (PM2 to run Node)
- Nginx in front (proxy /api → Node)
- Optional S3 for product images

Bonus (partially implemented)
- JWT-based auth utilities present; can gate admin actions
- Filtering/pagination can be added via query params (pattern shown in code)

---

## API (Simple)

Base URL (local): http://localhost:3001/api

- GET /products
  - Returns array of products

- POST /products
  - Body: { name: string, price: number, category?: string, stockStatus?: 'in_stock'|'out_of_stock', description?: string }
  - Creates a product and returns it

Also available in codebase
- GET /products/:id, POST /products/update, DELETE /products/delete/:id

---

## Tech Choices (Why)

- React + SCSS: fast to build, easy to style, huge ecosystem
- Node.js + Express: simple REST server, great dev speed
- MySQL: reliable relational DB, easy local and cloud (RDS)
- JWT: lightweight, stateless auth as we grow

---

## Architecture (Plain Words)

- Front‑end (React): shows products, submit add form
- Back‑end (Express): routes under /api/products, talks to MySQL
- Database (MySQL): stores product rows
- Optional AWS: Nginx on EC2 serves React build and proxies /api to Node; images can go to S3

---

## Project Plan (1–2 pages condensed)

Team of 3 (about 1 day)
- Dev A (Front‑end): Product list, add form, responsive styles, basic validation
- Dev B (Back‑end): GET/POST endpoints, validation, optional pagination/filtering
- Dev C (DevOps/DB): Schema creation, seed data, Nginx + PM2 on EC2, docs

Suggested timeline
- Hour 0–1: Agree on fields and API contract, set up repo
- Hour 1–2: Build Express routes + MySQL queries
- Hour 2–3: Build React pages + styles
- Hour 3–4: Optional polish (auth, filters), write README

---

## Deployment Plan (AWS)

- Use GitHub Actions (provided) to build client and deploy to EC2
- PM2 keeps Node running; Nginx serves React and proxies /api
- Secrets: SSH key, JWT secrets, and DB config via server/.env
- For production DB, use Amazon RDS (MySQL); update server/database/connection.js env vars
- For images, prefer S3 + CloudFront; store imageUrl in product rows

---

## Future Enhancements

- Better admin auth + roles
- Server‑side validation and error messages
- Pagination/sorting/filtering on list
- Swagger/OpenAPI docs
- Tests + seed scripts

---

## Deliverables

- Code in this repo (server + client)
- This README as documentation
- Optional: short screen recording (2–3 mins) walking through list, add product, and the AWS plan

---

## File Pointers

- Back‑end entry: `server/app.js`
- DB config: `server/database/connection.js`
- Product API: `server/routes/productRoutes.js`, `server/controllers/productController.js`
- Front‑end entry: `client/src/index.js`
- API base URL: `client/src/components/apiConfig.js`












