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

update:
DONE: Backend fully functional (auth, menu, orders, sockets). Frontend: 
      login/register, customer menu + cart + order placement — tested 
      working end to end via UI.
NEXT: Kitchen dashboard (view orders, update status) — most important 
      remaining piece since it showcases real-time Socket.io updates.

DONE: Full order flow working end-to-end, live, no refresh needed:
      customer places order -> kitchen sees it instantly via socket.io ->
      kitchen advances status (pending -> preparing -> ready -> completed) ->
      updates live on kitchen dashboard. Auth, roles, menu, orders, 
      real-time all functional and tested.
NEXT: Waiter dashboard (place dine-in orders for a table). Then optional:
      Admin menu management UI, Tables CRUD, polish/deploy.


=========
# Restaurant Ordering App — Handoff / Continuation Doc

This project is an assigned internship task (Tilla Health). Read this fully before making changes — it explains what exists, why decisions were made, and exactly what's left.

## Context & constraints
- Developer's machine: 2014 MacBook Air, macOS Big Sur (11), Node v18.20.8. This is old/unsupported by many current tool versions.
- **Recurring issue**: newer tool versions with native binaries (esbuild, Tailwind v4/oxide, create-vite v9) fail with `EBADENGINE` warnings or `dyld: Symbol not found` errors on this machine. **Fix pattern that has worked every time: pin an older major version** rather than debugging the native binary. Examples already hit:
  - `create-vite@9` failed → used `create-vite@5` successfully
  - `@tailwindcss/vite` (Tailwind v4, needs Node 20+, native oxide engine) failed → switched to `tailwindcss@3` + `postcss` + `autoprefixer` (works fine on Node 18)
  - `npx prisma init` initially failed on esbuild dyld error, later succeeded on retry — Prisma itself is fine, just watch for this class of error if it recurs
- **Implication for whoever continues**: if you're about to install a new package, check its Node requirement first, or be ready to pin an older version if `EBADENGINE` or dyld errors appear.
- Time pressure: this was built in a single ~10-hour sprint. Code favors "working and clean enough" over "maximally robust."

## Tech stack
- **Backend**: Express + Prisma ORM + SQLite, JWT auth (jsonwebtoken + bcrypt), Socket.io for real-time
- **Frontend**: React (Vite), React Router, Axios, Tailwind CSS v3, socket.io-client
- **No MongoDB** — originally considered, dropped in favor of SQL specifically because of local install/compatibility concerns on this machine

## Roles
- `customer` — browses menu, places delivery orders, tracks status
- `waiter` — places dine-in orders on behalf of a table (enters table number manually)
- `kitchen` — sees live queue of all orders, advances status
- `admin` — intended to manage menu (not yet built in frontend; backend routes exist)

## Data model (Prisma — `backend/prisma/schema.prisma`)
- `User` (id, name, email, passwordHash, role, phone)
- `MenuCategory` (id, name, sortOrder) → has many `MenuItem`
- `MenuItem` (id, categoryId, name, description, price, isAvailable)
- `Table` (id, tableNumber, capacity, status) — auto-created on the fly when a waiter enters a new table number (see below)
- `Order` (id, orderType: "delivery"|"dine_in", customerId?, waiterId?, tableId?, deliveryAddress?, status, totalPrice, createdAt, updatedAt)
- `OrderItem` (id, orderId, menuItemId, quantity, unitPrice — snapshotted at order time, specialInstructions)

Order status flow: `pending → preparing → ready → completed` (also `cancelled` and `out_for_delivery` exist as valid values but aren't wired into any UI flow yet).

## What's DONE and tested working end-to-end

### Backend (`/backend`)
- `prisma/schema.prisma` — full schema above, migrated
- `src/controllers/auth.controller.js` + `src/routes/auth.routes.js` — register, login, returns JWT
- `src/middleware/auth.middleware.js` — verifies JWT, attaches `req.user = { id, role }`
- `src/middleware/role.middleware.js` — `requireRole(...roles)` gate
- `src/controllers/menu.controller.js` + `src/routes/menu.routes.js` — GET categories/items (public), POST/PATCH/DELETE items (admin-only, untested from frontend since no admin UI yet, but routes work via curl)
- `src/controllers/order.controller.js` + `src/routes/order.routes.js`:
  - `createOrder` — handles both `delivery` (needs customerId + deliveryAddress) and `dine_in` (needs waiterId + tableId; **auto-upserts a Table record** if the entered table number doesn't exist yet — no manual table management needed)
  - `getOrders` — scoped by role: customer sees own orders, waiter sees own placed orders, kitchen/admin see all
  - `updateOrderStatus` — validates status, updates, **includes items+menuItem+table in the response** (this was a real bug we fixed — without the `include`, the socket-pushed order object was missing `items`, which silently broke the live UI until a full page refresh re-fetched via GET)
- `src/sockets/orderSocket.js` — `initSocket(server)`, `emitOrderUpdate(order)`. Emits `orderUpdated` event on both order creation and status update. Wired via raw `http.createServer(app)` in `server.js` (Socket.io needs a raw HTTP server, not just the Express app).
- `.env` has `DATABASE_URL` (from Prisma init) and `JWT_SECRET` (random hex string, generated via `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### Frontend (`/frontend`)
- Vite + React scaffolded, Tailwind v3 configured (see constraints above re: v4)
- Theme: primary `#EA580C` (Tailwind `orange-600`), hover `#C2410C` (`orange-700`), background white, secondary bg `orange-50` (`#FFF7ED`), text `stone-900`/`stone-500`
- `src/services/api.js` — axios instance, auto-attaches JWT from localStorage via interceptor
- `src/context/AuthContext.jsx` — `login`, `register`, `logout`, persists user+token to localStorage, `useAuth()` hook
- `src/sockets/socket.js` — socket.io-client instance connected to `VITE_SOCKET_URL`
- `src/App.jsx` — React Router setup with `PrivateRoute` (checks auth + role), routes: `/login`, `/register`, `/menu` (customer), `/kitchen` (kitchen/admin), `/waiter` (waiter)
- `src/pages/Login.jsx`, `src/pages/Register.jsx` — styled, functional, role-based redirect after login (customer→/menu, kitchen→/kitchen, waiter→/waiter, admin→/menu as fallback)
- `src/pages/customer/CustomerMenu.jsx` — fetches menu by category, cart state (add/remove), delivery address input, places order via POST /orders — **tested working**
- `src/pages/kitchen/KitchenDashboard.jsx` — fetches orders on mount, listens for `orderUpdated` socket event and merges into state (new orders prepended, existing orders updated in place), button advances status per the flow above, filters out completed/cancelled from view — **tested working, confirmed real-time (no refresh needed)**
- `src/pages/waiter/WaiterDashboard.jsx` — same menu+cart pattern as CustomerMenu but table-number input instead of address, orderType `dine_in` — **just built, needs testing** (was mid-test when this handoff was requested — confirm it still works: place an order as waiter, confirm it appears live on kitchen dashboard with the table number shown)

## Environment / run commands
```bash
# Backend
cd backend
node src/server.js   # port 5000

# Frontend (separate terminal)
cd frontend
npm run dev           # port 5173

# View/edit DB directly
cd backend
npx prisma studio     # port 5555
```

Test accounts created so far (password `1234` for all):
- `test@test.com` — role `customer`
- `kitchen@test.com` — role `kitchen`
- `waiter@test.com` — role `waiter`
- No `admin` role account created yet

## What's NOT done — in priority order

1. **Verify WaiterDashboard works** — this was just built and not yet confirmed end-to-end (place dine-in order → check it shows on kitchen dashboard with table number, and that the auto-upsert Table logic doesn't error).

2. **Admin menu management UI** — backend routes already exist and work (`POST/PATCH/DELETE /api/menu/items`, admin-only). Need a frontend page: `src/pages/admin/AdminMenu.jsx` — form to add/edit/delete menu items and categories. Without this, menu items can only be added via `npx prisma studio`, which is fine for a demo but weak for "admin functionality" as a feature. Also need `/admin` route + redirect for admin role in Login.jsx (currently falls through to `/menu`).

3. **Polish pass**:
   - Loading states (spinners/skeletons) while fetching menu/orders — currently just blank until data arrives
   - Empty states are minimal — could look nicer
   - No shared nav/header component — header markup is duplicated across CustomerMenu, KitchenDashboard, WaiterDashboard. Worth extracting to `src/components/Header.jsx` if time allows, purely for code cleanliness (a reviewer may notice repetition).
   - No customer order-history view (customer can place orders but can't see past order status after leaving the page) — `GET /orders` already returns this scoped correctly, just needs a small UI page.
   - No form validation feedback beyond basic required fields.

4. **Deployment** (optional but strong signal of finishing a "real" project):
   - Backend → Railway or Render (needs `DATABASE_URL` — note: SQLite file-based DB doesn't persist well on most free hosting; consider switching to hosted Postgres via the same Prisma schema if deploying seriously, since Render/Railway free tiers often have ephemeral filesystems that wipe SQLite files on redeploy)
   - Frontend → Vercel, with `VITE_API_URL`/`VITE_SOCKET_URL` env vars pointed at the deployed backend URL
   - CORS on the backend socket/Express config currently allows `origin: '*'` — fine for dev, should be tightened to the actual deployed frontend URL if this goes live

5. **README** — repo currently has a placeholder README. Before submitting, write a real one: what it does, tech stack, screenshots, setup instructions, and login credentials for demo/testing.

6. **Skipped by design, mention if asked**: dedicated Tables CRUD UI (tables are auto-created on first use by a waiter, which was a deliberate time-saving shortcut), payment integration, order cancellation, `out_for_delivery`-specific delivery-tracking UI (status exists in the enum but no delivery-person role or view was built).

## Git workflow notes
- Repo: solo project, mostly committed to `main` directly with descriptive commit messages after each working feature (register/login → menu CRUD → orders → sockets → kitchen dashboard → etc.)
- `.gitignore` at repo root excludes `node_modules/`, `.env`, `*.db`, `*.db-journal`, `dist/`
- `PROGRESS.md` at repo root has been kept updated after each major milestone — check it for the most current status if this doc is stale.

## If you're a new AI picking this up
Ask the developer to paste their current `PROGRESS.md` content alongside this doc to confirm nothing has changed since this was written, then resume at step 1 of the "What's NOT done" list above.


DONE: All 3 core roles fully working end-to-end with real-time sync:
      customer (delivery orders), waiter (dine-in orders, auto-creates
      table on first use), kitchen (live queue, status updates).
NEXT: Admin menu management UI (backend routes exist, no frontend yet),
      then polish (loading states, shared header, order history),
      then optional deployment.