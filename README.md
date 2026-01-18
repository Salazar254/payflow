# PayFlow

PayFlow is an instant settlement payment platform designed specifically for Kenyan businesses. It addresses the common pain point of delayed withdrawals (2-7 days) from other processors by settling customer payments directly to the merchant's M-Pesa account in seconds.

## 🚀 Key Features

*   **Instant M-Pesa Settlement**: Funds move from the customer to the merchant's M-Pesa account in ~5 seconds. NO holding period.
*   **Payment Links**: Generate direct checkout URLs to share via WhatsApp, SMS, or Email.
*   **Website Integration**: Copy-paste embed code to add a "Pay with M-Pesa" button to any website.
*   **Premium Dashboard**: A modern, glassmorphic admin interface to manage transactions, view analytics, and generate links.
*   **Secure Authentication**: Robust email/password login and account management.
*   **Customer-Facing Checkout**: A polished, trustworthy public payment page.

## 💰 Revenue Model

PayFlow operates on a simple, transparent **Transactional Revenue Model**.

*   **Fee**: **2% Flat Fee** per transaction.
*   **Structure**: The fee is deducted automatically at the time of payment.
    *   *Example*: If a customer pays **KES 1,000**, PayFlow keeps **KES 20** and instantly settles **KES 980** to the merchant.
*   **No Hidden Costs**:
    *   ❌ No monthly subscription fees.
    *   ❌ No setup or onboarding charges.
    *   ❌ No withdrawal fees (since settlement is automatic).
*   **Incentive**: Free processing for the first 3 months for early waitlist signups.

## 🛠️ Technical Architecture

### Tech Stack
*   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide React (Icons).
*   **Backend**: Node.js, Express.js.
*   **Database**: File-based JSON storage (Prototype Phase) -> Migrating to MongoDB/PostgreSQL.
*   **Payment Gateway**: IntaSend (Integration for M-Pesa STK Push).

### How It Works (User Flow)
1.  **Merchant Sign Up**: Merchant creates an account via the Dashboard.
2.  **Link Generation**: Merchant enters an amount (e.g., KES 500) in the dashboard to create a uniquely trackable payment link.
3.  **Customer Payment**:
    *   Customer clicks the link and lands on the secure checkout page.
    *   Customer enters their M-Pesa phone number.
    *   PayFlow API triggers an M-Pesa STK Push to the customer's phone.
4.  **Processing & Settlement**:
    *   Customer enters their PIN.
    *   Transaction is processed.
    *   **98%** of funds are automatically settled to the Merchant's M-Pesa.
    *   **2%** fee is routed to PayFlow's account.
5.  **Notification**: Merchant sees the transaction update instantly on their dashboard.

## ⚙️ Setup & Installation

Follow these steps to run PayFlow locally.

### Prerequisites
*   Node.js (v18 or higher)
*   npm (v9 or higher)

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/yourusername/payflow.git
cd payflow

# Install Backend Dependencies
cd api
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Run the Application
You can start both the backend and frontend using the provided helper script (Windows):
```bash
# From the root directory
start_payflow.bat
```

Or run them manually in separate terminals:

**Backend (API)**
```bash
cd api
node server.js
# Runs on http://localhost:3000
```

**Frontend (Client)**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

## 🗺️ Roadmap & Future Improvements

*   **Database Migration**: Move from `transactions.json` to a robust SQL database (PostgreSQL) for scalability.
*   **Live Payment Integration**: Finalize production API keys with IntaSend/Safaricom Daraja API.
*   **Analytics Upgrade**: Add daily/weekly revenue charts and exportable PDF reports.
*   **Multi-User Access**: Allow merchants to add staff members to their dashboard.

---
&copy; 2026 PayFlow Kenya.
