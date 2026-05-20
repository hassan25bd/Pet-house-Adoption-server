# Pet Adoption House — Server

REST API backend for the Pet Adoption House platform. Built with Node.js, Express, and MongoDB Atlas. Handles authentication, pet listings, and adoption requests.

---

## Live URL

**Server:** https://pet-adoption-house-server.vercel.app  
**Client:** https://pet-adoption-house.vercel.app

---

## Purpose

This server powers all backend operations for Pet Adoption House — user registration, JWT-based authentication, full CRUD for pet listings, and a complete adoption request workflow including approve and reject functionality.

---

## Features

- **JWT Authentication** — Issues signed JWT tokens stored in HTTPOnly cookies. Includes a `verifyToken` middleware that protects private routes
- **Pet CRUD API** — Create, read, update, and delete pet listings. Updates and deletes are owner-only (verified by email from JWT payload)
- **Search, Filter & Sort** — `/pets` endpoint supports `$regex` search by name, `$in` filter by species, and multi-field sort by price or age
- **Adoption Request System** — Submit, approve, and reject adoption requests. Approving one request automatically rejects all others and marks the pet as adopted
- **Owner Dashboard API** — `/pets/owner/my-listings` returns listings with request counts. `/requests/pet/:id` returns all requests for a specific pet
- **Serverless-Safe MongoDB** — Lazy connection with module-level caching (`let cachedDb`) for safe reuse across Vercel serverless invocations
- **CORS for Vercel** — Dynamically allows any `*.vercel.app` domain plus configurable `CLIENT_URL` from environment variables
- **Health Check Endpoint** — `GET /health` returns server uptime for monitoring

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/jwt` | Issue JWT cookie |
| POST | `/logout` | Clear JWT cookie |

### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/users` | Register user (no duplicates) |

### Pets
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/pets` | Public | All pets with search/filter/sort |
| GET | `/pets/featured` | Public | Latest 6 available pets |
| GET | `/pets/:id` | Public | Single pet by ID |
| POST | `/pets` | Private | Add new pet listing |
| PUT | `/pets/:id` | Private | Update pet (owner only) |
| DELETE | `/pets/:id` | Private | Delete pet + its requests (owner only) |
| GET | `/pets/owner/my-listings` | Private | Owner's listings with request counts |

### Requests
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/requests` | Private | Submit adoption request |
| GET | `/requests/my` | Private | User's own requests |
| GET | `/requests/pet/:petId` | Private | All requests for a pet (owner only) |
| PATCH | `/requests/:id/approve` | Private | Approve request, reject others, mark pet adopted |
| PATCH | `/requests/:id/reject` | Private | Reject a single request |
| DELETE | `/requests/:id` | Private | Cancel request (requester only) |

---

## NPM Packages Used

| Package | Purpose |
|---|---|
| `express` | Web framework and routing |
| `mongodb` | MongoDB native driver |
| `jsonwebtoken` | JWT generation and verification |
| `cookie-parser` | Parse HTTPOnly cookies from requests |
| `cors` | Cross-origin resource sharing configuration |
| `dotenv` | Load environment variables from `.env` |
| `nodemon` | Auto-restart on file changes during development |

---

## How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/hassan25bd/Pet-house-Adoption-server.git
cd Pet-house-Adoption-server

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Fill in your values

# 4. Start the dev server
npm run dev
```

Server runs at `http://localhost:5000`

---

## Environment Variables

Create a `.env` file:

```
PORT=5000
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## Deployment

Deployed to **Vercel** as a serverless Node.js function.

- Entry point: `index.js`
- `vercel.json` routes all requests to `index.js`
- Environment variables set in Vercel project settings (never committed to git)
