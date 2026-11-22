# 🌱 AgriConnect — Farm to Table Marketplace

## Stack
- **Frontend**: React + Vite, React Router, Axios
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose

## Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env       # Fill in your MONGO_URI and JWT_SECRET
node seed.js               # Creates admin user
npm run dev                # Starts on port 5000
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev                # Starts on port 5173
```

## Default Admin Credentials
- Email: `admin@agriconnect.com`
- Password: `Admin@1234`

## User Flows
| Role    | After Login |
|---------|-------------|
| Farmer  | `/farmer` dashboard — submit KYC, add products |
| Buyer   | `/marketplace` — browse, cart, checkout |
| Admin   | `/admin` — approve KYC, products, view orders |

## Key Features
- OTP-based registration (logged to console in dev)
- Farmer KYC approval before listing products
- Product listings with admin approval
- Escrow payments — released on delivery confirmation
- Real-time order status tracking
- AI-suggested pricing (mock: 5% above listed price)
- Smart advisory panel (weather, market prices, crop recommendations)
- Ratings & reviews system
- Admin analytics dashboard
