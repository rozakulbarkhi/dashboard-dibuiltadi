# Dashboard Dibuiltadi

A modern business dashboard application built with React, TypeScript, and Vite. This dashboard provides comprehensive business analytics, customer management, and transaction tracking capabilities.

## Features

- **Authentication System**: Secure login and registration with JWT token management
- **Dashboard Overview**: Real-time business metrics and analytics
- **Customer Management**: Complete CRUD operations for customer data with advanced filtering
- **Transaction Tracking**: Comprehensive transaction management and reporting
- **Analytics & Reports**: Daily, monthly, and yearly transaction summaries with interactive charts
- **Profile Management**: User profile and password management
- **Responsive Design**: Mobile-first design with modern UI components

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Routing**: React Router v7
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI with Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A backend API server

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd dashboard-dibuiltadi
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Set up environment variables:

```bash
cp .env-example .env
```

Update the `VITE_API_URL` in `.env` with your backend API URL.

4. Start the development server:

```bash
bun dev
# or
npm run dev
```

### Build for Production

```bash
bun run build
# or
npm run build
```

## Project Structure

```
src/
├── api/           # API client and endpoints
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── layouts/       # Layout components
├── pages/         # Page components
├── providers/     # Context providers
├── schemas/       # Zod validation schemas
├── stores/        # Zustand stores
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Key Pages

- **Dashboard**: Main overview with key metrics
- **Summary**: Detailed analytics and reports
- **Customers**: Customer management interface
- **Transactions**: Transaction tracking and management
- **Profile**: User profile and settings

## Contributing

1. Follow the existing code style and conventions
2. Use TypeScript for type safety
3. Write meaningful commit messages
4. Test your changes before submitting
