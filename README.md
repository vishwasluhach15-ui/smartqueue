# 🚀 Smart Queue — Zero Wait
### India Innovates 2026 | Municipal Corporation of Delhi | Urban Solutions

> *Eliminating multi-hour queues at government offices with a smart virtual token & real-time alert system.*

**Team:** Kamal · Vishwas · Mukul
**Institution:** UIET, Maharshi Dayanand University (MDU), Rohtak, Haryana

---

## 🌐 Live Links

| Resource | URL |
|----------|-----|
| 🌍 Live App | [frontend-three-green-27.vercel.app](https://frontend-three-green-27.vercel.app) |
| ⚙️ Backend API | [smartqueue-backend-q2um.onrender.com](https://smartqueue-backend-q2um.onrender.com) |
| 📺 Display Board | [frontend-three-green-27.vercel.app/display](https://frontend-three-green-27.vercel.app/display) |
| 🔍 API Health | [/api/health](https://smartqueue-backend-q2um.onrender.com/api/health) |

---

## 📱 Screenshots

| Home Screen | Token Tracker | Admin Dashboard | Display Board |
|-------------|--------------|-----------------|---------------|
| Offices with live queue | Real-time ring progress | Analytics + queue mgmt | Office monitor screen |

---

## ✨ Features

### For Citizens
- 📱 **Virtual Token** — Book slot via app or SMS (no internet needed for SMS)
- 🔔 **Live Notifications** — SMS alert when 3 people remain ahead
- 📊 **Real-time Tracker** — Live queue ring with position & estimated wait
- 🎙️ **Voice Alert** — Auto voice announcement when it's your turn
- ❌ **Cancel Token** — Cancel anytime before being served
- 🔐 **Password Reset** — OTP-based secure password recovery

### For Offices (Admin)
- 📺 **Display Board** — Full-screen board for office monitors with voice announcements
- 📊 **Live Dashboard** — Real-time stats, charts, queue management
- ⏭️ **Call Next Token** — One-click with automatic voice + SMS to citizen
- 🚫 **No-Show Marking** — Mark absent citizens
- 📈 **Analytics** — Hourly charts, performance metrics
- 🔄 **Office Toggle** — Open/close office instantly

### Technical Highlights
- ⚡ **Real-time Socket.io** — Zero-refresh live updates
- 📱 **SMS Fallback** — Works without internet via Twilio
- 🔒 **Privacy-First** — No Aadhaar needed, phone only
- 🌍 **Multi-city** — Rohtak, Delhi NCR, Gurugram offices
- 🌐 **Multi-language Ready** — Hindi + English support

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + React Router |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose (Atlas Cloud) |
| Real-time | Socket.io |
| SMS | Twilio API |
| Auth | JWT + bcrypt |
| Fonts | Space Grotesk + DM Sans |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🏗️ Project Structure

```
smartqueue/
├── backend/
│   ├── server.js              # Express + Socket.io server
│   ├── models/
│   │   ├── User.js            # Citizen / Admin model
│   │   ├── Office.js          # Government office model
│   │   └── Token.js           # Queue token model
│   ├── routes/
│   │   ├── auth.js            # Register, Login, OTP, Reset
│   │   ├── offices.js         # Offices CRUD + seed
│   │   ├── tokens.js          # Book, view, cancel tokens
│   │   └── admin.js           # Dashboard, call-next, no-show
│   ├── middleware/
│   │   └── auth.js            # JWT + adminOnly guards
│   └── config/
│       └── sms.js             # Twilio SMS helper
│
└── frontend/
    └── src/
        ├── App.js             # Routes + auth guards
        ├── api.js             # Axios + Socket.io client
        ├── index.css          # Global dark theme
        ├── admin.css          # Admin portal styles
        ├── context/
        │   └── AuthContext.js
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── Home.js        # Offices + active token
            ├── BookToken.js   # Service select + confirm
            ├── MyToken.js     # Live tracker + voice
            ├── AdminDash.js   # Admin portal
            ├── DisplayBoard.js # Office monitor screen
            ├── ForgotPassword.js
            └── Profile.js
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/smartqueue
JWT_SECRET=your_secret_key
PORT=5000
CLIENT_URL=http://localhost:3000

# Optional — Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# → Server running on port 5000

# Terminal 2 — Frontend
cd frontend && npm start
# → Opens http://localhost:3000
```

### 4. Seed Demo Data

```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:5000/api/offices/seed/demo" -Method POST -UseBasicParsing
```

---

## 🔑 API Reference

### Auth
```
POST /api/auth/register          # Citizen register
POST /api/auth/login             # Login
POST /api/auth/register-admin    # Admin register (requires secret key)
POST /api/auth/send-otp          # Send OTP for password reset
POST /api/auth/reset-password    # Reset password with OTP
```

### Offices
```
GET  /api/offices                # List all offices
GET  /api/offices/:id            # Single office details
POST /api/offices/seed/demo      # Seed demo data (Rohtak + Delhi NCR)
```

### Tokens
```
POST  /api/tokens/book           # Book a token
GET   /api/tokens/my             # My tokens
GET   /api/tokens/:id            # Token status
PATCH /api/tokens/:id/cancel     # Cancel token
```

### Admin (JWT required)
```
GET   /api/admin/dashboard       # Live dashboard + stats
POST  /api/admin/call-next       # Call next token (SMS + voice)
PATCH /api/admin/token/:id/no-show  # Mark no-show
PATCH /api/admin/office/toggle   # Open/close office
```

---

## 🎮 Demo Credentials

```
Admin Login:
  Phone    → +919876500001
  Password → admin123

Admin Registration Secret Key → SMARTQUEUE-ADMIN-2026
```

---

## 🎯 Demo Flow for Judges

1. **Open** → [frontend-three-green-27.vercel.app](https://frontend-three-green-27.vercel.app)
2. **Register** as citizen → See 6 offices (Rohtak + Delhi + Gurugram)
3. **Book** a token at any office → Get token tracker screen
4. **Open new tab** → Login as Admin (`+919876500001` / `admin123`)
5. **Click "Call Next Token"** on admin dashboard
6. **Watch Tab 1** → Queue updates LIVE via Socket.io ⚡
7. **Open** `/display` → Full-screen office board with voice announcements 📺

---

## 🏆 Why Smart Queue Wins

| Feature | Manual Token | Generic Apps | **Smart Queue** |
|---------|-------------|--------------|-----------------|
| Virtual Token | ❌ | ✅ | ✅ |
| SMS Fallback | ❌ | ❌ | ✅ |
| Real-time Updates | ❌ | ❌ | ✅ |
| Voice Announcements | ❌ | ❌ | ✅ |
| Display Board | ❌ | ❌ | ✅ |
| Admin Dashboard | ❌ | ✅ | ✅ |
| No Hardware Needed | ✅ | ❌ | ✅ |
| Free for Citizens | ✅ | ❌ | ✅ |

**Smart Queue is the ONLY solution built specifically for Indian government offices — offline-ready, multilingual, zero hardware.**

---

## 🗺️ Roadmap

| Phase | Timeline | Goal |
|-------|----------|------|
| Phase 1 | Now | Pilot: 5 MCD offices in Rohtak |
| Phase 2 | 3 Months | Scale: 50+ offices Delhi NCR |
| Phase 3 | 1 Year | National rollout + State API |

---

## 💰 Business Model

- **Govt SaaS License** — ₹50K–₹2L / office / year (PRIMARY)
- **Setup & Integration** — ₹1L–₹5L per department (ONE-TIME)
- **CSR / Govt Grants** — Smart City Mission, Digital India (UP TO ₹50L)
- **Analytics Premium** — ₹25K–₹1L / department / year (FUTURE)

*Free for citizens. Sustainable for the government.*

---

## 👥 Team

| Name | Role | Branch | Year |
|------|------|--------|------|
| Kamal | Frontend Dev | CSE | 1st Year |
| Vishwas| Backend Dev | BCA | 1st Year |
| Mukul | Backend Dev | CSE | 1st Year |

**UIET — University Institute of Engineering & Technology**
**Maharshi Dayanand University (MDU), Rohtak, Haryana**

---

*Built with ❤️ for India Innovates 2026 · Municipal Corporation of Delhi*