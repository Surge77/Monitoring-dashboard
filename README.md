# Metrics Monitoring Dashboard

A full-stack application for collecting, visualizing, and alerting on time-series metrics. Built with Next.js (frontend) and Express.js (backend).

## Features

- Metric ingestion via REST API
- Time-series data storage using SQLite/Prisma
- Aggregated views (hourly/daily) with configurable ranges
- Threshold-based alerting with a cron job
- JWT authentication with HTTP-only cookies

## Tech Stack

**Backend:** Node.js, Express, Prisma, SQLite, JWT, bcrypt, node-cron
**Frontend:** Next.js 14, React, Recharts, Tailwind CSS

## Project Structure

```
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── jobs/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   └── scripts/
│       └── ingest-metrics.ts
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── (protected)/
│   │   │   ├── dashboard/
│   │   │   └── alerts/
│   │   └── layout.tsx
│   ├── lib/
│   └── types/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

The server runs on `http://localhost:3001`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

### Environment Variables

**backend/.env:**
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
PORT=3001
```

**frontend/.env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## API Endpoints

### Auth
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

### Metrics
- `POST /metrics` - Ingest a metric value
- `GET /metrics` - List all metrics
- `GET /metrics/:id` - Get metric details
- `GET /metrics/:id/aggregate` - Get aggregated data

### Alerts
- `POST /alerts` - Create alert rule
- `GET /alerts` - List alert rules
- `PUT /alerts/:id` - Update alert rule
- `DELETE /alerts/:id` - Delete alert rule
- `GET /alerts/events` - Get triggered events

## How Alerting Works

A cron job runs every minute to check alert rules:
1. Fetches all active rules
2. Gets the latest value for each metric
3. Compares against threshold
4. Creates an alert event if triggered (with 1-min dedup)

Supported operators: `>`, `<`, `>=`, `<=`

## Sample Data

To populate the dashboard with sample metrics:

```bash
cd backend
npx ts-node scripts/ingest-metrics.ts
```

This creates a demo user and sends CPU, memory, disk usage, etc.

## Limitations

- Single-tenant (no multi-user orgs)
- Polling-based updates (no WebSocket)
- No data retention policy
- Basic alerting (no notification channels)
