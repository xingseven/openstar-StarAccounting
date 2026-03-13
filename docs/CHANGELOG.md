# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-03-13

### Architecture
- **Frontend Refactor**: Migrated frontend to a Feature-based architecture (`src/features/*`).
  - Separated UI/Theme logic from Page/Data logic.
  - Created dedicated feature modules for `dashboard`, `assets`, `consumption`, `savings`, and `loans`.
  - Implemented `DefaultTheme` components for all major pages to support future theming capabilities.

### Added
- **UI Components**: Integrated `shadcn/ui` component library.
- **Charts**: Integrated `recharts` and `shadcn/charts` for professional data visualization.
  - **Consumption**: Added Platform Distribution (Pie), Income/Expense Analysis (Donut), Merchant Ranking (Bar), Expense Trend (Line), Category Stacked Bar, Heatmap, and Pareto Analysis.
  - **Assets**: Added Asset Valuation Cards.
  - **Loans**: Added Repayment Schedule and Remaining Principal Analysis charts.
  - **Savings**: Added Savings Progress Tracking and Goal Visualization.
- **Mock Mode**: Added static mock data support for Consumption page visualization preview.

### Changed
- **Backend Port**: Changed default backend API port from `3001` to `3006` to avoid conflicts.
- **Navigation**: Updated Sidebar and Header with modern design and Lucide icons.
- **Theme**: Unified chart color palette using CSS variables (`--chart-1` to `--chart-5`).

## [Unreleased]

### Added
- **ExchangeRate**: Added backend API `/api/exchange-rates` for fetching and updating exchange rates.
- **Assets**: Added multi-currency support in Asset page. Users can now toggle display currency (CNY/USD/EUR/etc.) and see estimated total value.
- **Infrastructure**: Added `docker-compose.yml` for PostgreSQL database setup.

### Changed
- **Database**: Switched from PostgreSQL to MySQL (8.0).
- **Assets API**: Updated `GET /api/assets` to accept `?currency=XXX` query parameter and return `estimatedValue` field.
- **Refactor**: Extracted business logic for Budget and Asset calculations into `src/logic/` directory.

### Scripts
- Added `npm run init:db` script for one-click database initialization (Schema push + Admin creation).

### Tests
- Added `vitest` unit tests for `Currency`, `Budget`, and `Asset` logic.

### Deployment
- Added `Dockerfile` for Server and Web.
- Updated `docker-compose.yml` to include full stack (Postgres + Server + Web).
- Added `docs/DEPLOY.md` for deployment instructions.
- Implemented `POST /api/exchange-rates/refresh` to fetch real-time exchange rates from `open.er-api.com`.

## [2026-03-13]

### Added
- **Budgets**: Implemented Budget management (Monthly/Yearly) with progress tracking.
- **Dashboard**: Added dashboard home page with aggregated data.
- **Loans**: Added repayment schedule calculation.
- **Settings**: Added profile and password update functionality.
- **Consumption**: Added CSV export and chart enhancements.

### Fixed
- Fixed `Suspense` boundary issue in Login page.
- Fixed `Prisma` validation error during build.
