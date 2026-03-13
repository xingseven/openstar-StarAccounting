# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **ExchangeRate**: Added backend API `/api/exchange-rates` for fetching and updating exchange rates.
- **Assets**: Added multi-currency support in Asset page. Users can now toggle display currency (CNY/USD/EUR/etc.) and see estimated total value.
- **Infrastructure**: Added `docker-compose.yml` for PostgreSQL database setup.

### Changed
- **Assets API**: Updated `GET /api/assets` to accept `?currency=XXX` query parameter and return `estimatedValue` field.
- **Refactor**: Extracted business logic for Budget and Asset calculations into `src/logic/` directory.

### Tests
- Added `vitest` unit tests for `Currency`, `Budget`, and `Asset` logic.

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
