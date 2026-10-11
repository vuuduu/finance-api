# finance-api

A personal finance API for tracking expenses, income, transfers, accounts, and budgets.
Built with [NestJS](https://nestjs.com/) and TypeScript, with SQLite for storage.

**Status:** Phase 1 in progress. Project setup (issue 01) and the database module
(issue 02) are done. No feature endpoints yet. The plan for each step is in
[docs/phase-1/issues/](docs/phase-1/issues/).

## Requirements

- Node.js 24 and npm

## Setup and scripts

```bash
npm install
```

| Command | What it does |
|---|---|
| `npm run start:dev` | Start the API on port 3000 (override with `PORT`), restarting on changes |
| `npm run build` | Compile to `dist/` |
| `npm test` | Run the unit tests (Jest) |
| `npm run lint` | Lint and auto-fix with ESLint |
| `npm run format` | Format with Prettier (4 spaces, single quotes) |

`GET http://localhost:3000/` returns `Hello World!`, a simple "the app is running" check.

## Database

- SQLite file at `.data/finance.db`, relative to the folder the app is started in. The
  app creates the folder, the file, and the tables on startup. `.data/` is Git-ignored.
- `DB_TYPE` picks the database adapter. Leave it unset (or set it to `sqlite`) for SQLite.
  `postgres` is planned but not built yet. Any other value stops the app at startup.

## Project structure

```
src/
├── main.ts                     # bootstrap and global ValidationPipe
├── app.module.ts               # root module; imports DatabaseModule.forRoot()
└── database/
    ├── database.module.ts      # picks adapters by DB_TYPE; global, imported once
    ├── database.tokens.ts      # DATABASE_CONNECTOR and SQL_BUILDER injection tokens
    ├── ports/                  # DatabasePort and SqlBuilderPort interfaces
    └── sqlite/                 # SQLite adapters and table definitions
```

Requests flow Controller → Service → Repository → `SqlBuilderPort` + `DatabasePort` →
database adapter. Services never use the database directly. See
[docs/phase-1/issues/02-database-module.md](docs/phase-1/issues/02-database-module.md)
for the full design.

## Request validation

A global `ValidationPipe` checks every request body against its DTO class. Fields the
DTO doesn't declare are removed, invalid input gets a `400`, and route and query
parameters are converted to their declared types.
