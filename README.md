# 🛍️ Advanced E-Commerce Backend API Engine

An enterprise-grade, highly optimized e-commerce REST API backend designed with Express, TypeScript, and MongoDB. Powered by Redis session caching, Stripe checkout payments, and the Resend SDK transactional email dispatcher. Exposes a 100% complete interactive OpenAPI 3.0 Swagger sandbox playground.

---

## ⚡ Architectural Highlights

*   **🔒 Complete Security (JWT & HttpOnly Cookies)**: Utilizes a dual-token pair system (short-lived access tokens + 7-day secure HttpOnly refresh cookies) with Redis-backed validation checks for robust token rotation security.
*   **📂 Structured OpenAPI 3.0 Sandbox**: A fully documented API portal served on `/api-docs/` allowing developer testing, header token authorizations, and payload sandboxing directly inside the browser.
*   **💳 Stripe Payment Gateway**: Fully integrated Stripe checkout creation endpoints paired with cryptographic webhook verification (`stripe-signature`) to securely fulfill orders.
*   **📨 Transactional Emails (Resend SDK)**: Asynchronously dispatches elegant welcome verification letters and timed password recovery links.
*   **💾 Database & Cache (Mongoose & Redis)**: Employs nested populate category hierarchies, automatic default shipping address toggles, and memory-cached token lookups.
*   **🔌 Real-Time Communications**: Integrated Socket.io namespaces supporting secure authorized query handshake handshakes for chat messaging.

---

## 🛠️ Prerequisites

Ensure you have the following installed locally on your system:
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (running instance or Atlas connection string)
*   [Redis Server](https://redis.io/) (running on port `6379`)
*   A [Stripe Developer Account](https://stripe.com/) (to acquire test API keys)
*   A [Resend Account](https://resend.com/) (to acquire transaction email keys)

---

## ⚙️ Installation & Setup Guide

### 1. Clone & Navigate to Project Directory
```bash
git clone <repository_url>
cd nodejs-adv
```

### 2. Install Project Dependencies
Install all production dependencies and TypeScript declaration packages:
```bash
npm install
```

### 3. Environment Variable Configuration
Copy the environment template file to create your active `.env` file:
```bash
cp .env-example .env
```

Open `.env` and configure your credentials:
```env
# Server Port Mapping
PORT=3000

# MongoDB URI String
MONGO_DB=mongodb://127.0.0.1:27017/ecommerce-backend

# JWT Sign Secrets
SECRET_KEY=your_super_secure_jwt_access_secret_key
REFRESH_SECRET_KEY=your_super_secure_jwt_refresh_secret_key

# Pagination Parameters
PAGE_SIZE=4

# Stripe Gateway integration (Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend SDK Configuration
RESEND_API_KEY=re_...
EMAIL_FROM=onboarding@resend.dev

# Auxiliary Legacy Email (Alternative SMTP)
SMTP_PORT=587
SMTP_HOST=smtp.mailtrap.io
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### 4. Initialize Local Cache Services
Make sure your local Redis instance is active. To start Redis on macOS (via Homebrew):
```bash
brew services start redis
```

*   **Tip**: If you ever need to purge your active cache sessions or reset token stores during development, use:
    ```bash
    redis-cli flushall
    ```
*   **Tip**: For UI monitoring, you can run `redis-commander` in another shell.

---

## 🚀 Running the Application

### Development Mode (Nodemon + ts-node)
Fires up the server with hot-reloads active upon any file modifications:
```bash
npm run dev
```

### Production Compilation
Transpiles TypeScript codebase cleanly into modular ES/CommonJS JavaScript within the `dist/` directory:
```bash
npm run build
```

### Run Production Server
Launches the compiled JavaScript bundle:
```bash
npm start
```

---

## 📘 Accessing Interactive Swagger API Docs

Once the backend starts, navigate to the interactive Swagger UI playground in your web browser:

👉 **[http://localhost:3000/api-docs/](http://localhost:3000/api-docs/)**

### 🔑 Sandboxed Token Authentication Guide:
1.  Navigate to **Authentication & Security** tag in Swagger UI and expand `POST /api/v1/users/login`.
2.  Hit **Try it out** and feed valid credentials. Click **Execute**.
3.  Copy the generated value from `data.token` inside the response body.
4.  Scroll to the very top right of the Swagger UI and click the green **Authorize** lock button.
5.  Paste your token into the Value box and click **Authorize**.
6.  *Success!* All protected endpoints (Carts, Address books, Products creation) are now unlocked for live developer sandboxing.

---

## 📁 Project Architecture & Layout

```text
├── src/
│   ├── controllers/      # Core REST API endpoint controller logic
│   ├── docs/             # OpenAPI 3.0 specs (swaggerSpec.ts)
│   ├── migrations/       # Starter data migrations & defaults
│   ├── models/           # Mongoose schemas (User, Product, Cart, Address, etc.)
│   ├── routes/           # Express router endpoints
│   ├── utils/            # Shared utilities (validator, helper, file saver)
│   └── index.ts          # Express root server initialization
├── dist/                 # Production compiled JavaScript files
├── package.json          # Dependency mappings & npm scripts
└── tsconfig.json         # Strict TypeScript verbatim compiler options
```

---

## 🛠️ TypeScript Verbatim Strictness
This repository operates under strict `verbatimModuleSyntax: true` inside CommonJS. When adding new modules:
*   Import standard Node packages via `require()` syntax.
*   Always export modules explicitly using `module.exports = ...` or `module.exports = { moduleName }` to ensure zero compilation or build crashes.
*   To check type safety, run `npx tsc --noEmit`.
