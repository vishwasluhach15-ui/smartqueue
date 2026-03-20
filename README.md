# Smart Queue — Zero Wait 🚀
### India Innovates 2026 | Municipal Corporation of Delhi | Urban Solutions

**Team:** Vishwas · Kamal · Kunal | UIET, MDU 

---

## What is this?
A full-stack web app that eliminates long queues at government offices.
Citizens get a virtual token + real-time SMS/app alerts. Staff get a live admin dashboard.

---

## Tech Stack
| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React.js + React Router           |
| Backend   | Node.js + Express                 |
| Database  | MongoDB (Mongoose)                |
| Realtime  | Socket.io (live queue updates)    |
| SMS       | Twilio (optional)                 |
| Auth      | JWT + bcrypt                      |

---

## Project Structure
```
smartqueue/
├── backend/
│   ├── server.js          # Express + Socket.io entry point
│   ├── models/
│   │   ├── User.js        # Citizen / Admin user model
│   │   ├── Office.js      # Government office model
│   │   └── Token.js       # Queue token model
│   ├── routes/
│   │   ├── auth.js        # Register / Login
│   │   ├── offices.js     # List & manage offices
│   │   ├── tokens.js      # Book / view / cancel tokens
│   │   └── admin.js       # Admin dashboard & call-next
│   ├── middleware/
│   │   └── auth.js        # JWT protect + adminOnly
│   ├── config/
│   │   └── sms.js         # Twilio SMS helper
│   └── .env.example       # Environment variables template
│
└── frontend/
    ├── src/
    │   ├── App.js          # Routes & auth guards
    │   ├── api.js          # Axios instance + Socket.io
    │   ├── index.css       # Global dark teal theme
    │   ├── context/
    │   │   └── AuthContext.js
    │   └── pages/
    │       ├── Login.js
    │       ├── Register.js
    │       ├── Home.js      # Offices list + active token
    │       ├── BookToken.js # Service select & confirm
    │       ├── MyToken.js   # Live token tracker (Socket.io)
    │       └── AdminDash.js # Admin panel (Socket.io)
    └── public/
        └── index.html
```

---

## Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas free tier)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env — set your MONGO_URI and JWT_SECRET

# Frontend
cd ../frontend
npm install
```

### 2. Start MongoDB
```bash
# Local MongoDB
mongod

# OR use MongoDB Atlas (free) — paste connection string in .env
```

### 3. Run Backend
```bash
cd backend
npm run dev       # uses nodemon for auto-restart
# Server starts on http://localhost:5000
```

### 4. Seed Demo Data
```bash
# Once server is running, seed 3 demo offices:
curl -X POST http://localhost:5000/api/offices/seed/demo
```

### 5. Run Frontend
```bash
cd frontend
npm start
# Opens http://localhost:3000
```

---

## API Endpoints

### Auth
| Method | Endpoint                  | Description         |
|--------|---------------------------|---------------------|
| POST   | /api/auth/register        | Citizen register    |
| POST   | /api/auth/login           | Login               |
| POST   | /api/auth/register-admin  | Admin register      |

### Offices
| Method | Endpoint                  | Description         |
|--------|---------------------------|---------------------|
| GET    | /api/offices              | List all offices    |
| GET    | /api/offices/:id          | Single office       |
| POST   | /api/offices/seed/demo    | Seed demo data      |

### Tokens
| Method | Endpoint                  | Description         |
|--------|---------------------------|---------------------|
| POST   | /api/tokens/book          | Book a token        |
| GET    | /api/tokens/my            | My tokens           |
| GET    | /api/tokens/:id           | Token status        |
| PATCH  | /api/tokens/:id/cancel    | Cancel token        |

### Admin (requires admin JWT)
| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| GET    | /api/admin/dashboard        | Live dashboard      |
| POST   | /api/admin/call-next        | Call next token     |
| PATCH  | /api/admin/token/:id/no-show| Mark no-show        |
| PATCH  | /api/admin/office/toggle    | Open/close office   |

---

## Creating an Admin Account

After seeding offices, get an office ID:
```bash
curl http://localhost:5000/api/offices
# Copy the _id of an office
```

Register an admin:
```bash
curl -X POST http://localhost:5000/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","phone":"+919876500001","password":"admin123","officeId":"<PASTE_OFFICE_ID>"}'
```

Login with those credentials → you'll be redirected to `/admin`.

---

## Real-time Features (Socket.io)

| Event            | Direction       | Payload                          |
|------------------|-----------------|----------------------------------|
| `join_office`    | Client → Server | officeId                         |
| `join_admin`     | Client → Server | officeId                         |
| `queue_update`   | Server → Client | type, currentToken, queueLength  |
| `dashboard_update`| Server → Admin | currentToken, serving token      |

When admin calls next token:
1. Server marks old token as `done`
2. New token set to `serving`
3. SMS sent to that person via Twilio
4. If 3rd person in queue — heads-up SMS sent to them
5. All connected clients get `queue_update` → UI refreshes instantly

---

## SMS Setup (Optional — Twilio)

1. Create free account at [twilio.com](https://twilio.com)
2. Get Account SID, Auth Token, Phone Number
3. Add to `.env`:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

Without Twilio, SMS messages are just logged to the console (demo mode).

---

## Demo Flow for Judges

1. Open app → Register as citizen
2. See nearby offices → click **Book** on any office
3. Select service → **Confirm & Get Token**
4. Watch live token tracker (MyToken page)
5. Open second tab → Login as admin → Admin Dashboard
6. Click **Call Next Token** — watch citizen's screen update in real-time!

---

## Built with ❤️ by Team Smart Queue
*UIET MDU  · India Innovates 2026 · Municipal Corporation of Delhi*
