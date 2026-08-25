# Financial OS

> Next-generation autonomous financial intelligence and personal financial operating system.

## Architecture Overview

Financial OS is structured as a high-performance monorepo:

- **`apps/web`**: Next.js 14+ frontend with App Router, Tailwind CSS, TypeScript, and modern UI components.
- **`apps/api`**: FastAPI high-performance Python backend powering calculation engines, AI intelligence (CIEL), and real-time financial tracking.
- **`packages/shared-types`**: Universal TypeScript definitions shared across the monorepo.
- **`packages/ui`**: Reusable component primitives and design tokens.
- **`packages/config`**: Shared configurations (ESLint, Prettier, Tailwind, TSConfig).
- **`database/`**: Migrations, seed data, and schema definitions.
- **`docs/`**: PRDs, architecture specifications, and user research.
- **`scripts/`**: Automation scripts for database seeding, health metric recalculations, and ingestion.

## Getting Started

### Prerequisites
- Node.js >= 20.x
- Python >= 3.11
- PostgreSQL & Redis (or use Docker Compose)
- pnpm >= 9.x

### Environment Setup
```bash
cp .env.example .env
```

### Running Locally with Docker Compose
```bash
docker-compose up -d
```

### Running Individual Services
```bash
# Frontend
cd apps/web
pnpm install
pnpm dev

# Backend
cd apps/api
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
