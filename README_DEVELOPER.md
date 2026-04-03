# Nutrition Shop Project: Architecture & Developer Guidelines

This document provides a source of truth for the project's architecture and coding patterns to ensure consistency across development sessions.

## 🏗️ Core Architecture
- **Frontend**: React (Vite) + Vanilla CSS (No Tailwind unless requested).
- **Backend**: Node.js + Express.
- **Database**: MongoDB (Mongoose).
- **Auth**: JWT-based (Admin uses `ADMIN_EMAIL`/`ADMIN_PASSWORD` from `.env`, Users use registered accounts).

---

## 📡 API & Data Fetching Patterns (CRITICAL)

### 1. Server-Side Pagination
The project has been migrated from client-side to **Server-Side Pagination**. 
- **DO NOT** fetch all items and `.slice()` them in the frontend.
- **ALWAYS** pass `page`, `limit`, and `search` parameters to the API.

**Standard Paginated Response Format:**
```json
{
  "products": [...], 
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50
  }
}
```
*Note: Key names like `products`, `orders`, or `history` vary by endpoint.*

### 2. Analytics & Aggregation
To prevent loading thousands of rows for dashboard stats, use dedicated aggregation endpoints:
- `GET /api/admin/products/stats`: Total products, active products, total stock value.
- `GET /api/admin/transactions/stats`: Total counts (processing, completed, etc.), total revenue, total items sold.
- `GET /api/admin/transactions/user-stats`: Grouped sales data by user (for User Sales Report).

---

## 🛠️ Key Files & Directories

### Backend (`/backend`)
- `routes/products.js`: Public shop APIs.
- `routes/users.js`: User profile & orders (Auth required).
- `routes/admin.js`: Admin inventory, transaction management, and analytics.
- `models/`: Mongoose schemas (Product, User, Transaction, InventoryLog).

### Frontend (`/frontend/src`)
- `api.js`: Central API helper. **Update this first** when adding new endpoints.
- `pages/`: Component-based routing.
- `hooks/`: Custom logic (e.g., `usePendingTransactionsCount.js` for polling).
- `styles/`: Modularized CSS objects (`adminStyles.js`, `pagesStyles.js`).

---

## ⚠️ Important Gotchas
1. **Currency**: Prices are stored in Cents/Integers but formatted as `VND` in the UI using `.toLocaleString('vi-VN')`.
2. **Polling**: The Admin Dashboard and Header use polling (15s) to check for new transactions. Always use `getAdminTransactionsStats` for counts to minimize payload.
3. **Product History**: Inventory changes are logged in the `InventoryLog` collection. Access via `api.getProductHistory`.
4. **Populate**: Backend routes often use `.populate('user')` or `.populate('product')`. Always check if nested properties exist in the frontend JSX.

---

## 📜 Coding Style
- Prefer `useReducer` for complex page states (like `UserDashboard`).
- Keep CSS variables in the theme system (`:root` in `index.css`).
- Use the `Pagination.jsx` component for any list with more than 10-15 items.
