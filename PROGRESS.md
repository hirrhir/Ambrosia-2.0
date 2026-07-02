Restaurant Ordering App — Progress Summary
Stack: Express + Prisma + SQLite (backend), React + Vite + Tailwind (frontend), Socket.io (real-time), JWT auth
Roles: customer (delivery orders), waiter (dine-in orders on behalf of customers), kitchen (updates order status), admin (manages menu)
Backend — /backend — DONE:

prisma/schema.prisma — models: User, MenuCategory, MenuItem, Table, Order, OrderItem
Auth: controllers/auth.controller.js, middleware/auth.middleware.js (JWT check), middleware/role.middleware.js (role check) — register/login working, tested
Menu CRUD: controllers/menu.controller.js, routes/menu.routes.js — public reads, admin-only writes
Orders: controllers/order.controller.js, routes/order.routes.js — create order (delivery or dine_in), get orders (scoped by role), update status — tested end-to-end
Real-time: sockets/orderSocket.js — emits orderUpdated event on order create/status change; wired into server.js via raw http server
Run backend: cd backend && node src/server.js (port 5000)

Frontend — /frontend — IN PROGRESS:

Vite + React scaffolded, Tailwind v3 configured (not v4 — Node 18 compatibility issue, avoid @tailwindcss/vite/oxide)
services/api.js — axios instance, auto-attaches JWT from localStorage
context/AuthContext.jsx — login/register/logout, persists to localStorage
sockets/socket.js — socket.io-client connection
pages/Login.jsx, pages/Register.jsx — built and styled (orange-600/white theme), tested working
pages/customer/CustomerMenu.jsx — placeholder only
Run frontend: cd frontend && npm run dev (port 5173)

Theme: primary #EA580C (orange-600), hover #C2410C, background white, secondary bg #FFF7ED, text #1C1917
Known environment quirks (2014 MacBook Air, macOS Big Sur, Node 18.20.8):

Newer tool versions with native binaries fail (EBADENGINE / dyld errors) — seen with esbuild, Tailwind v4/oxide, create-vite v9. Fix: pin older major versions (tailwindcss@3, create-vite@5, etc.) rather than fighting the newest release.

Not started yet:

Menu browsing + cart UI (CustomerMenu)
Waiter, Kitchen, Admin dashboards/pages
Wiring Socket.io client into UI for live order status
Table management routes (optional, low priority)
Deployment (optional bonus)

Immediate next step: build out CustomerMenu.jsx — fetch menu items from /api/menu/items, display with cart state, submit order via /api/orders.
Paste this into PROGRESS.md in your repo root so it's saved regardless of chat/token limits.