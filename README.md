# Enterprise Carpooling Platform

A production-grade enterprise ride-sharing platform where employees of a registered organization can find rides as passengers or offer rides as drivers. Built with MERN stack, featuring real-time tracking, Razorpay payments, wallet system, admin dashboard, and AI-powered ride matching.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite), Tailwind CSS, Zustand, Recharts, Socket.io Client |
| Backend | Node.js, Express, MongoDB (Mongoose), Redis (ioredis), Socket.io |
| Auth | JWT (Access + Refresh), Google OAuth 2.0, Passport.js |
| Payments | Razorpay (Orders, Webhooks, Dynamic UPI QR) |
| Storage | ImageKit |
| Email | Brevo (Transactional) |
| AI | Google Gemini |
| Maps | Google Maps Platform |
| DevOps | Docker, Docker Compose |

## Project Structure

```
odoo_carpooling/
├── client/          # React Frontend (Vite)
├── server/          # Node.js Backend (Express)
├── docker-compose.yml
├── Dockerfile.client
├── Dockerfile.server
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis (local or Cloud)
- Docker & Docker Compose (optional)

### Environment Setup

1. Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```

2. Install dependencies:
```bash
# Server
cd server && npm install

# Client
cd client && npm install
```

3. Seed the database:
```bash
cd server && npm run seed
```

4. Start development:
```bash
# Server (from /server)
npm run dev

# Client (from /client)
npm run dev
```

### Docker (Alternative)
```bash
docker-compose up --build
```

## Sample Data

| Employee | Email | Department | Role |
|----------|-------|-----------|------|
| Raj Patel | raj.patel@co.com | Engineering | Driver |
| Krishna Singh | krishna.s@co.com | Sales | Driver |
| Priya Nair | priya.nair@co.com | HR | Employee |

**Organization**: Odoo Pvt. Ltd., Gandhinagar, Software Industry

## Features

- 🚗 Find & Offer Rides with route matching
- 📍 Live Trip Tracking with real-time map
- 💳 Razorpay Payments + UPI QR Codes
- 💰 In-app Wallet with recharge
- 🔐 QR-based Trip Verification
- 🌱 CO2 Savings / ESG Dashboard
- 🆘 SOS Emergency Button
- ⭐ Trust Score & Ratings
- 🏆 Gamification Leaderboard
- 📊 Admin Reports & Analytics
- 🤖 AI Smart Ride Matching (Gemini)
- 💬 Real-time Chat with Driver

## License

MIT
