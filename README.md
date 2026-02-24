# SaaS Subscription Demo

A minimal full-stack SaaS subscription demo showcasing user authentication, Stripe Checkout integration, webhook handling, and subscription-based access control.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript
- **Backend**: NestJS, TypeScript
- **Database**: MongoDB
- **Payments**: Stripe Checkout (Test Mode)

## Features

- ✅ User authentication (email + password, JWT-based)
- ✅ Public landing page with pricing
- ✅ Stripe Checkout integration for subscriptions
- ✅ Webhook endpoint with signature verification
- ✅ Protected routes and API endpoints
- ✅ Subscription status persistence
- ✅ Dashboard with premium content access

## Project Structure

```
saas-subscription-demo/
├── frontend/          # Next.js application
│   ├── app/          # App Router pages
│   └── lib/          # API utilities and auth helpers
├── backend/          # NestJS API
│   └── src/
│       ├── auth/     # Authentication module
│       ├── users/    # User management
│       └── stripe/   # Stripe integration
└── README.md
```

## Setup Instructions

### Prerequisites

- **Node.js 20.9.0 or higher** (required)
- MongoDB running locally or connection string
- Stripe account (test mode)

**Note**: Node.js 18 is not supported. Please use Node.js 20 or higher. You can use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions:
```bash
nvm install 20
nvm use 20
```

### 1. Backend Setup

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# - MONGODB_URI: MongoDB connection string
# - JWT_SECRET: Secret key for JWT tokens
# - STRIPE_SECRET_KEY: Your Stripe secret key (test mode)
# - STRIPE_PRICE_ID: Your Stripe price ID
# - STRIPE_WEBHOOK_SECRET: Webhook signing secret (see Stripe setup below)

# Start backend
npm run start:dev
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
# Ensure Node.js 20 is active
node --version  # Should show v20.x.x

cd frontend
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local if backend URL differs
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### 3. Stripe Setup (Test Mode)

1. **Create a Stripe Account** (if you don't have one)
   - Go to https://stripe.com
   - Sign up and navigate to the Dashboard

2. **Create a Product and Price**
   - Go to Products → Add Product
   - Name: "Premium Plan"
   - **IMPORTANT**: Select "Recurring" pricing (not one-time)
   - Billing period: Monthly
   - Price: $9.99/month
   - Copy the **Price ID** (starts with `price_`)
   - Add this to `backend/.env` as `STRIPE_PRICE_ID`
   - **Note**: The price MUST be recurring/subscription type, not one-time

3. **Get API Keys**
   - Go to Developers → API keys
   - Copy the **Secret key** (starts with `sk_test_`)
   - Add this to `backend/.env` as `STRIPE_SECRET_KEY`

4. **Set up Webhook Endpoint**
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `http://localhost:8000/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy the **Signing secret** (starts with `whsec_`)
   - Add this to `backend/.env` as `STRIPE_WEBHOOK_SECRET`

   **Note**: For local development, use Stripe CLI to forward webhooks:
   ```bash
   stripe listen --forward-to localhost:8000/stripe/webhook
   ```
   This will give you a webhook secret that starts with `whsec_`

### 4. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install and start MongoDB
# On macOS with Homebrew:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# Connection string: mongodb://localhost:27017/saas-demo
```

**Option B: MongoDB Atlas (Cloud)**
- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Get connection string and update `MONGODB_URI` in `backend/.env`

## Usage Flow

1. **Register/Login**
   - Visit `http://localhost:3000`
   - Register a new account or login
   - You'll be redirected to the dashboard

2. **Subscribe**
   - Go to Pricing page
   - Click "Subscribe Now"
   - You'll be redirected to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date, any CVC
   - Complete the payment

3. **Webhook Processing**
   - After payment, Stripe sends webhook to backend
   - Backend verifies signature and marks user as paid
   - User is redirected to dashboard

4. **Access Premium Content**
   - Dashboard shows subscription status
   - Premium content is unlocked for paid users
   - Protected API endpoint `/users/protected` is accessible

## Testing Stripe Webhooks Locally

Use Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Linux: See https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:8000/stripe/webhook
```

This will output a webhook signing secret. Use this in your `backend/.env` file.

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users/me` - Get current user profile (protected)
- `GET /users/protected` - Get premium content (requires subscription)

### Stripe
- `POST /stripe/create-checkout-session` - Create Stripe checkout session (protected)
- `POST /stripe/webhook` - Handle Stripe webhooks

## Environment Variables

### Backend (.env)
- `PORT` - Backend server port (default: 8000)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `STRIPE_SECRET_KEY` - Stripe secret key (test mode)
- `STRIPE_PRICE_ID` - Stripe price ID for subscription
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## Troubleshooting

### Webhook not working
- Ensure Stripe CLI is running and forwarding to correct URL
- Check webhook secret matches the one from `stripe listen`
- Verify raw body is being preserved (check backend logs)
- If using production, ensure webhook endpoint URL is publicly accessible
- Check that `rawBody: true` is set in `main.ts` (already configured)
- Verify the webhook route `/stripe/webhook` is not being parsed as JSON

### MongoDB connection issues
- Ensure MongoDB is running
- Check connection string format
- Verify network access if using Atlas

### CORS errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check backend CORS configuration in `main.ts`

### Stripe "recurring price" error
- **Error**: "You must provide at least one recurring price in subscription mode"
- **Solution**: 
  - Go to Stripe Dashboard → Products
  - Ensure your price is set as **Recurring** (not one-time)
  - Create a new price if needed: Select "Recurring" → Monthly/Yearly → Set amount
  - Update `STRIPE_PRICE_ID` in `.env` with the recurring price ID
  - The code now validates this automatically and will show a clear error if wrong price type is used

## Production Considerations

Before deploying to production:

1. **Security**
   - Use strong, unique `JWT_SECRET`
   - Enable HTTPS
   - Use production Stripe keys
   - Set up proper CORS origins
   - Add rate limiting

2. **Database**
   - Use production MongoDB instance
   - Set up backups
   - Configure connection pooling

3. **Webhooks**
   - Update webhook endpoint URL in Stripe Dashboard
   - Use production webhook secret
   - Monitor webhook delivery in Stripe Dashboard

4. **Error Handling**
   - Add comprehensive error logging
   - Set up error monitoring (e.g., Sentry)
   - Add retry logic for webhook processing

## License

MIT
