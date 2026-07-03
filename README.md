## Live Demo
- Frontend: https://ambrosia-2-0.vercel.app
- Backend API: https://ambrosia-2-0.onrender.com/api

# Ambrosia — Restaurant Ordering App

A full-stack restaurant ordering system supporting delivery orders (customers) and dine-in orders (waiters), with a live kitchen queue that updates in real time.

## Features

- **Customer** — browse the menu, add items to a cart, place delivery orders, view order history with live status
- **Waiter** — place dine-in orders on behalf of a table (table auto-created on first use)
- **Kitchen** — live queue of all incoming orders (delivery + dine-in), advance order status with one click
- **Real-time updates** — powered by Socket.io; orders and status changes appear instantly across all connected clients, no refresh needed
- **Role-based auth** — JWT-based login with role-gated routes (customer / waiter / kitchen / admin)

## Tech Stack

**Backend:** Node.js, Express, Prisma ORM, SQLite, JWT (jsonwebtoken + bcrypt), Socket.io
**Frontend:** React (Vite), React Router, Axios, Tailwind CSS, socket.io-client

## Project Structure

```
ambrosia/
├── backend/
│   ├── prisma/           # schema, migrations
│   ├── src/
│   │   ├── controllers/  # route logic
│   │   ├── routes/       # Express route definitions
│   │   ├── middleware/   # auth + role checks
│   │   ├── sockets/      # Socket.io setup
│   │   └── utils/
│   └── .env
├── frontend/
│   └── src/
│       ├── pages/         # customer/, kitchen/, waiter/ views
│       ├── components/    # shared components (Header)
│       ├── context/        # AuthContext
│       ├── services/       # API client
│       └── sockets/        # Socket.io client
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
node src/server.js
```

Create a `.env` file in `backend/` with:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET=<any long random string>
```

Server runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in `frontend/` with:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

App runs on `http://localhost:5173`.

## Adding Menu Data

Menu items can be added via Prisma Studio for now:
```bash
cd backend
npx prisma studio
```
Add a `MenuCategory` first, then `MenuItem` records linked to it by `categoryId`.

## Demo Accounts

| Role     | Email               | Password |
|----------|---------------------|----------|
| Customer | test@test.com       | 1234     |
| Waiter   | waiter@test.com     | 1234     |
| Kitchen  | kitchen@test.com    | 1234     |

(Register new accounts via `POST /api/auth/register` with a `role` field — the sign-up form defaults new users to `customer`.)

## How the Real-Time Flow Works

1. A customer places a delivery order, or a waiter places a dine-in order.
2. The backend saves the order and emits an `orderUpdated` event via Socket.io.
3. The kitchen dashboard, listening for that event, adds the new order to its live queue instantly.
4. Kitchen staff advances the order through `pending → preparing → ready → completed`; each change emits another `orderUpdated` event, keeping every connected client in sync without polling or refreshing.

## Notes

- SQLite is used for local development simplicity. For production deployment, swapping to a hosted Postgres database (e.g. via Supabase) is a straightforward Prisma datasource change.
- Table records for dine-in orders are created automatically the first time a waiter enters a new table number — no manual table setup required.

