<div align="center">

# 🎯 Smart Job Tracker

### AI-powered job application tracker built for students

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-teal?style=for-the-badge)](https://smart-ai-job-tracker.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-blue?style=for-the-badge)](https://smart-job-tracker-api.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/GitHub-nitinjaiswal02-black?style=for-the-badge&logo=github)](https://github.com/nitinjaiswal02/smart-job-tracker)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Nitin%20Jaiswal-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/nitin-jaiswal-219545328)

[Live Demo](https://smart-ai-job-tracker.vercel.app) • [Report Bug](https://github.com/nitinjaiswal02/smart-job-tracker/issues) • [Request Feature](https://github.com/nitinjaiswal02/smart-job-tracker/issues)

</div>

---

## 📌 The Problem

Students applying to internships and entry-level roles routinely apply to **100+ positions** across a hiring season. Spreadsheets get abandoned. Interview dates get missed. Follow-up emails never get sent.

## ✅ The Solution

Smart Job Tracker keeps every application organized, scores your resume against real job descriptions using AI, and automatically reminds you before you miss an interview.

---

## 🚀 Live Demo

🌐 **Frontend:** https://smart-ai-job-tracker.vercel.app

> ⚡ First load may take 30-40 seconds if the server is waking up (free tier).

---

## 📸 Screenshots

### 🏠 Landing Page

<img width="1466" height="805" alt="Screenshot 2026-07-05 at 3 34 18 PM" src="https://github.com/user-attachments/assets/efa3d2cb-0ced-4a97-a1a3-b5047f4fcbd8" />


---

### 📊 Dashboard — Application Tracking

<img width="1466" height="805" alt="Screenshot 2026-07-05 at 3 34 48 PM" src="https://github.com/user-attachments/assets/6d6511df-8a70-47bd-aea7-c50dfed8911e" />


---

### 🤖 AI Resume Scorer

<img width="1466" height="805" alt="Screenshot 2026-07-05 at 3 37 24 PM" src="https://github.com/user-attachments/assets/1281e3ac-969f-476f-9d6f-959d03bb2587" />
<img width="1466" height="805" alt="Screenshot 2026-07-05 at 3 37 32 PM" src="https://github.com/user-attachments/assets/7fc733d3-7246-496d-8afa-3a5a0a9cfda5" />


---

### ✅ ATS Checker

<img width="1466" height="805" alt="Screenshot 2026-07-05 at 3 37 51 PM" src="https://github.com/user-attachments/assets/0a47bafb-8011-4292-a85d-cea5cb25cecd" />


---

### ✉️ Follow-up Email Generator

<img width="1466" height="805" alt="Screenshot 2026-07-05 at 3 38 07 PM" src="https://github.com/user-attachments/assets/8a32403d-20c2-4995-ba1a-9c2372290b93" />



=======
>>>>>>> 6bb2471 (docs: add MIT license)
## ✨ Features

### Core Tracking
- 📋 **Application Dashboard** — Track every application with company, role, status, dates, and notes
- 🎨 **Color-coded Status System** — Visual status tracking (Applied → Interviewing → Offer/Rejected)
- 🔍 **Search & Filter** — Find applications by company, role, or status instantly
- 📱 **Fully Responsive** — Works on mobile, tablet, and desktop

### AI-Powered Features (Groq — Llama 3.3)
- 🤖 **Resume Scorer** — Paste your resume + job description → match score (0-100) with strengths, improvements, and missing keywords
- 🔎 **ATS Checker** — Detect resume formatting issues that get filtered by Applicant Tracking Systems
- ✉️ **Follow-up Email Generator** — AI-drafted personalized follow-up emails for stale applications

### Automation
- ⏰ **Interview Reminders** — Automatic email + real-time notification on interview day (daily 8AM cron)
- 📧 **Stale Application Follow-up** — AI-generated follow-up drafts emailed after 14 days of no response
- 🔔 **Real-time Updates** — Live status changes across all open tabs without page refresh (Socket.io)

### Authentication & Security
- 🔐 **JWT Authentication** — Secure login with httpOnly cookies
- 🔑 **Forgot Password** — Email-based password reset with 15-minute expiry tokens
- 🛡️ **IDOR Prevention** — Every query scoped to authenticated user
- 🚫 **Mass Assignment Protection** — Field whitelist on all update operations

### Monetization Ready
- 💎 **Freemium Model** — 10 free AI calls/day
- 💳 **Razorpay Integration** — Payment infrastructure built and tested (test mode)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework with fast HMR |
| Tailwind CSS v4 | Utility-first styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Socket.io Client | Real-time WebSocket connection |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database with schema validation |
| JWT + bcryptjs | Authentication and password hashing |
| Socket.io | Real-time bidirectional events |
| node-cron | Scheduled background jobs |
| Nodemailer + Gmail SMTP | Transactional emails |
| Groq AI (Llama 3.3-70b) | Resume scoring and email generation |
| Razorpay | Payment processing |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting (auto-deploy on push) |
| Render | Backend hosting (auto-deploy on push) |
| MongoDB Atlas | Cloud database |
| UptimeRobot | Uptime monitoring — prevents server sleep |

---

<<<<<<< HEAD
## 📁 Project Structure

```text
smart-job-tracker/
│
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── ai.js                 # Groq AI client
│   │   ├── razorpay.js           # Razorpay client
│   │   └── socket.js             # Socket.io setup with JWT auth
│   │
│   ├── controllers/
│   │   ├── authController.js         # Register, login, logout, forgot/reset password
│   │   ├── applicationController.js  # CRUD + Socket.io real-time emit
│   │   ├── aiController.js           # Resume score, ATS check, follow-up email
│   │   └── paymentController.js      # Razorpay order creation + signature verification
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT authentication middleware
│   │   ├── aiLimitMiddleware.js  # Free tier rate limiting (10 calls/day)
│   │   └── errorHandler.js       # Centralized error handling
│   │
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt pre-save hook
│   │   └── Application.js        # Application schema with embedded comments
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── aiRoutes.js
│   │   └── paymentRoutes.js
│   │
│   ├── utils/
│   │   ├── generateToken.js      # JWT signing + httpOnly cookie
│   │   ├── sendEmail.js          # Nodemailer wrapper
│   │   └── cronJobs.js           # Interview reminders + stale follow-ups
│   │
│   └── server.js                 # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios instance + API wrappers
│   │   ├── components/           # Button, Input, Navbar, ApplicationCard, etc.
│   │   ├── context/              # AuthContext, SocketContext
│   │   ├── pages/                # Landing, Dashboard, Login, Register,
│   │   │                         # ResumeAI, Pricing, ForgotPassword, etc.
│   │   └── main.jsx              # App entry point with providers
│   │
│   ├── vercel.json               # React Router fix for Vercel
│   └── index.html
│
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier)
- Groq API key — free at [console.groq.com](https://console.groq.com)
- Gmail account with App Password enabled

### 1. Clone the repository

```bash
git clone https://github.com/nitinjaiswal02/smart-job-tracker.git
cd smart-job-tracker
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `backend/.env`:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=your_groq_api_key
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

```bash
npm run dev
# Server starts at http://localhost:5001
# You should see: MongoDB connected: ...
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

`frontend/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

```bash
npm run dev
# Frontend starts at http://localhost:5173
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| POST | `/api/auth/logout` | Logout | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| POST | `/api/auth/forgot-password` | Send reset email | ❌ |
| POST | `/api/auth/reset-password/:token` | Reset password | ❌ |

### Applications
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/applications` | Create application | ✅ |
| GET | `/api/applications` | List (filter/search/paginate) | ✅ |
| GET | `/api/applications/:id` | Get single application | ✅ |
| PUT | `/api/applications/:id` | Update application | ✅ |
| DELETE | `/api/applications/:id` | Delete application | ✅ |
| POST | `/api/applications/:id/comments` | Add comment | ✅ |

### AI Features
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/ai/score-resume` | Score resume vs job description | ✅ |
| POST | `/api/ai/ats-check` | ATS compatibility check | ✅ |
| POST | `/api/ai/generate-followup` | Generate follow-up email draft | ✅ |

### Payments
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/payment/create-order` | Create Razorpay order | ✅ |
| POST | `/api/payment/verify` | Verify payment signature | ✅ |

---

## 🏗️ Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                     Client Browser                      │
│                  React + Vite (Vercel)                  │
└──────────────────────┬───────────────────────────────────┘
                       │
                 HTTP + WebSocket
                       │
┌──────────────────────▼───────────────────────────────────┐
│                  Express Server (Render)                │
│                                                          │
│  ┌────────────┐   ┌────────────┐   ┌─────────────────┐   │
│  │  REST API  │   │ Socket.io  │   │   Cron Jobs     │   │
│  │   Routes   │   │ Real-time  │   │   node-cron     │   │
│  └────────────┘   └────────────┘   └─────────────────┘   │
└──────────────────────┬──────────────────┬────────────────┘
                       │                  │
            ┌──────────▼───────┐   ┌──────▼────────────────┐
            │  MongoDB Atlas   │   │     External APIs     │
            │    (Database)    │   │                        │
            └──────────────────┘   │ • Groq AI (Llama 3.3) │
                                   │ • Gmail SMTP          │
                                   │ • Razorpay            │
                                   └────────────────────────┘

                              ▲
                              │
               UptimeRobot pings /api/health
                        every 5 minutes
```

---

## 🔒 Security Highlights

- **JWT in httpOnly cookies** — XSS attacks se protected
- **bcrypt** — 10 salt rounds password hashing
- **IDOR Prevention** — Har query `user: req.user._id` se scoped
- **Mass Assignment Protection** — Field whitelist on updates
- **HMAC-SHA256** — Razorpay payment signature server-side verification
- **AI Rate Limiting** — 10 calls/day free tier
- **Token Hashing** — Password reset tokens hashed before DB storage
- **NoSQL Injection Prevention** — express-mongo-sanitize (Phase 14)

---

## 🗺️ Roadmap

- [ ] Google OAuth (Login with Google)
- [ ] Email verification on register
- [ ] Resume PDF upload (Cloudinary)
- [ ] Referral marketplace
- [ ] Advanced analytics dashboard
- [ ] Browser extension for one-click job saving
- [ ] Mobile app (React Native)

---

## 👨‍💻 Author

**Nitin Jaiswal**

[![GitHub](https://img.shields.io/badge/GitHub-nitinjaiswal02-black?style=flat&logo=github)](https://github.com/nitinjaiswal02)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Nitin%20Jaiswal-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/nitin-jaiswal-219545328)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>If this project helped you, please give it a ⭐ on GitHub!</p>
  <p>Built with ❤️ for students who are tired of losing track of their job search.</p>
</div>

