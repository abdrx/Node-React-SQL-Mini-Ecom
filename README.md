# Mini eCommerce – Setup & Run (Quick Start)

This section shows exactly how to create the database, configure environment variables, run migrations, and start both the backend (Node/Express) and frontend (React).

## Prerequisites

- Node.js LTS and npm
- MySQL (XAMPP or native install)

## 1) Create the database

The app expects a database named `miniecom` using the default XAMPP credentials (user `root`, empty password).

Choose one:

- MySQL CLI
    ```sql
    CREATE DATABASE miniecom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```
- phpMyAdmin (XAMPP)
    1. Open http://localhost/phpmyadmin
    2. Click “Databases” → Create database `miniecom`
    3. Set collation to utf8mb4_unicode_ci → Create

You do NOT need to run `database/createTables.sql` manually—migrations will create/update tables.

## 2) Configure the backend (server/.env)

Create `server/.env` with:

```env
USE_LOCALHOST=true

# JWT secrets (use long random values)
JWT_SECRET_KEY_ACCESS_TOKEN=replace_with_a_random_long_string
JWT_SECRET_KEY_REFRESH_TOKEN=replace_with_a_different_random_long_string

# For non-local DBs set USE_LOCALHOST=false and configure below
# DB_SERVER_HOST=your-mysql-host
# DB_SERVER_USER=your-user
# DB_SERVER_PASSWORD=your-password
# DB_SERVER_DATABASE=miniecom
```

## 3) Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

## 4) Run DB migrations (recommended)

```bash
cd server
npm run migrate
```

This creates/updates tables (`users`, `product`, `orders`, `shopingCart`, `productsInOrder`) and product fields (`category`, `stockStatus`, `stock`, `imageUrl`). Migrations also run automatically on server start.

## 5) Start the backend

```bash
cd server
npm run start
```

- API: http://localhost:3001/
- Static images: http://localhost:3001/uploads/

If port 3001 is busy:

```bash
lsof -n -iTCP:3001 -sTCP:LISTEN -P
kill -9 <PID>
```

## 6) Start the frontend

Optionally create `client/.env` (defaults to http://localhost:3001/):

```env
REACT_APP_API_URL=http://localhost:3001/
```

Run the app:

```bash
cd client
npm start
```

- Frontend: http://localhost:3000/

---

# Mini eCommerce Product Listing Module

This repository implements the assignment: a mini eCommerce product listing module with a simple React front‑end, a Node.js/Express back‑end, MySQL storage, and AWS deployment guidance.

## Overview

You can:

- View a list of products
- Add a new product via a simple form
- Persist products in a SQL database (MySQL)
- Call REST APIs to fetch and create products
- Optionally extend with authentication, pagination, filtering, and AWS hosting

The codebase already includes broader eCommerce scaffolding (auth, cart, orders). This document focuses on the required “Product Listing” module while mapping to the existing structure.

## Tech Stack (Why these choices)

- Front‑end: React + SCSS
    - React is widely adopted, fast to iterate on, and pairs nicely with REST APIs.
    - SCSS keeps the UI clean and responsive with minimal setup; you may add Bootstrap or any UI library.
- Back‑end: Node.js + Express
    - Lightweight HTTP server, great developer ergonomics, and simple REST routing.
- Database: MySQL
    - Relational schema fits product catalog basics; easy local setup and AWS RDS compatibility.
- Auth: JSON Web Tokens (JWT) (optional, built-in in this repo)
    - Simple stateless auth for future admin features.

## Architecture Overview

Simple three‑tier app:

- Client (React): Renders product list and add‑product form. Calls REST APIs.
- Server (Express): Exposes product endpoints; validates and writes to MySQL.
- Database (MySQL): Stores product records.

AWS suggestion (no paid deployment required):

- API on EC2 (Dockerized Node app or PM2)
- MySQL on Amazon RDS (or keep local for development)
- Product images (if added) on S3 with optional CloudFront CDN

## Requirements Mapping

Front‑end:

- Product list: shows name, price, and description today.
- Add product: simple form (name, price, description).
- Responsive UI via SCSS; feel free to add a UI kit.

Note on Category and Stock Status: the current schema does not include these columns. You can add them with a small migration (see “Optional DB fields” below) and wire them to the form and list.

Back‑end APIs (as implemented):

- GET /api/products → Fetch all products
- POST /api/products/create → Add a new product

These map to the assignment’s GET /products and POST /products. If desired, you can add an alias route POST /api/products to match the exact path.

Data storage:

- MySQL table product with columns: productId, name, description, price, createdDate

### Optional DB fields (Category, Stock Status)

If you want to fully reflect “Category” and “Stock Status”, you can extend the schema like this:

ALTER TABLE product
    ADD COLUMN category VARCHAR(50) NULL AFTER name,
    ADD COLUMN stockStatus ENUM('in_stock','out_of_stock') DEFAULT 'in_stock' AFTER category;

Then update the server model/controller to read/write these fields and display them on the UI.

## Getting Started

### 1) Clone the repository

git clone <https://github.com/abdrx/Node-React-SQL-Mini-Ecom>

### 2) Database setup

- Create a MySQL database and run database/createTables.sql
- If you added optional fields, run the ALTER TABLE above.
- Check server/database/connection.js for connection configuration.

### 3) Server setup

cd server
npm install

Create a .env file (or configure connection.js) with your DB credentials if needed. Start the server (migrations will run automatically before the server starts):

npm run start

Optional: start in debug mode

npm run debug

Server runs by default on http://localhost:3001
\n+Manual migration commands (optional):
\n+npm run migrate         # apply latest
\nnpm run migrate:rollback # rollback last batch

### 4) Client setup

cd client
npm install
npm run start

Client runs by default on http://localhost:3000 and calls the API at http://localhost:3001 (see client/components/apiConfig.js to adjust).

If installs fail, try removing package-lock.json and reinstall.

## API Reference

Base URL: http://localhost:3001/api

- GET /products
    - Description: Fetch all products
    - Response: 200 OK with JSON array of products

- POST /products/create
    - Description: Create a new product
    - Body (JSON): { name: string, price: number, description?: string }
    - Response: 200 OK with insert result

Optional (existing in codebase):

- GET /products/:id → Single product by id
- POST /products/update → Update product
- DELETE /products/delete/:id → Delete product

If you add Category and Stock Status, extend the payload accordingly.

## Front‑end Usage

- Product listing page is provided in client/src/components/ProductList (CustomerProductList/AdminProductList) and related containers.
- Add Product form exists under Admin components (AdminProductDetails/AdminProductList). For the assignment scope, a minimal Add form includes name, price, and description. Add optional fields after extending the DB.
- Styling: SCSS files alongside components. You can add Bootstrap or any UI kit.

## Cloud / AWS Integration (documentation)

No paid deployment is required. Suggested approach:

API on EC2

1. Build a small Amazon Linux 2023 EC2 instance.
2. Install Node.js LTS and PM2 (or use Docker + ECS).
3. Clone this repo, set environment variables, and run the server with PM2.
4. Open security group for port 80/443 and place Nginx in front as a reverse proxy.

Database on RDS (optional)

1. Create RDS MySQL instance (free tier if eligible).
2. Migrate schema (run createTables.sql) and update server/database/connection.js to use the RDS endpoint.

Static front‑end hosting

1. Build React app (npm run build) and host on S3 + CloudFront, or use any static host.

Images on S3 (optional)

1. Create an S3 bucket for product images.
2. Store object keys in the product table (add imageUrl column) and serve via CloudFront for better latency.

## Bonus (Optional)

- Authentication: Use existing JWT utilities (server/utils/token.js) and Login/Register components to add admin‑only create/update/delete permissions.
- Pagination/Filtering: Add query params to GET /api/products (e.g., ?page=1&pageSize=10&category=Shoes&minPrice=10&maxPrice=100) and implement SQL LIMIT/OFFSET + WHERE filters. Update the UI with a simple filter bar.

## Project Plan (1–2 pages)

### Tech Stack Justification

- React for fast UI development and easy state management.
- Express for straightforward REST APIs and middleware.
- MySQL for relational guarantees and easy migration to AWS RDS.
- JWT for simple, stateless auth as the app grows.

### Architecture Overview

Client (React)

- Product List view (fetches GET /api/products)
- Add Product form (submits POST /api/products/create)

Server (Node/Express)

- Routes under /api/products
- Controllers: validation and orchestration
- Models: SQL queries via a pooled MySQL connection

Data (MySQL)

- product table (productId, name, description, price, createdDate)
- Optional: category, stockStatus, imageUrl

AWS (suggested)

- EC2 for API, RDS for MySQL, S3(+CloudFront) for assets

### Task Breakdown (Team of 3, ~1 day for this module)

- Dev A (Front‑end)
    - Product list page + responsive styles
    - Add Product form + basic validation
    - Optional: filter/pagination UI

- Dev B (Back‑end)
    - Implement GET/POST endpoints and validation
    - Optional: alias POST /api/products, pagination/filtering with SQL
    - Unit tests for controller/model (time permitting)

- Dev C (DevOps/DB)
    - MySQL schema + seed data
    - AWS documentation (EC2/RDS/S3) and environment setup
    - Optional: Dockerfile, Nginx reverse proxy config

Suggested timeline (approximate):

- Hour 0–1: Schema review, endpoint contract, UI wireframe
- Hour 1–2: Implement server + DB calls
- Hour 2–3: Implement client + basic styles
- Hour 3–4: Optional extras (auth, pagination, filters) and docs polish

### Deployment Plan (AWS)

- CI: GitHub Actions to build and run tests
- Infra: EC2 (API) + RDS (DB) + S3/CloudFront (static/assets)
- Runtime: PM2 or Docker on EC2
- Observability: CloudWatch logs/alarms
- Backups: RDS automated backups, S3 versioning
- Security: Security groups, least‑privileged IAM roles, secret management via SSM Parameter Store

### Future Enhancements

- Categories, stock tracking, image uploads
- Search with filters and sorting
- Role‑based access control (admin vs customer)
- Server‑side input validation and better error handling
- OpenAPI/Swagger docs for APIs
- Tests (unit and integration) and seed data scripts

## Notes

- This module sits inside a larger sample app (auth, orders, cart already present). For this assignment, you only need the pieces described above to demonstrate the listing and create flow.
- If you need the exact POST /products route (without /create), add a new route in server/routes/productRoutes.js that forwards to productController.createProduct.











