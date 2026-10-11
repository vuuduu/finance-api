# 02 — Database module and SQLite adapter

## Description

**Context.** finance-api uses the Port/Adapter pattern for persistence. Services
depend on a `DatabasePort` interface, never on SQLite directly, so a PostgreSQL
adapter can replace SQLite later. Phase 1 uses SQLite through `better-sqlite3` with
raw, parameterized SQL. Every later module stores its data through this module.

**Depends on:** 01 (project setup).

**Persistence design (decided by the project owner, 2026-10-07).**

Ports and layers:
- `DatabasePort`: one low-level, async port. Services never depend on it or call it
  directly. Methods (each takes `sql` and `params: SqlParam[]`, where
  `SqlParam = string | number | null` fills one `?` placeholder):
  - `insert` → the new row's id
  - `run` (update or delete) → how many rows changed
  - `get` → one row, or `undefined`
  - `all` → an array of rows
- `SqlBuilderPort`: repositories describe queries through it. Its adapter writes the
  dialect-specific raw SQL. Its contract grows as repositories need new queries.
- Repositories: one per module, concrete classes (not ports). They give services
  domain-level methods, map rows to entities, and get both `DatabasePort` and
  `SqlBuilderPort` injected.
- Flow: Service → Repository → `SqlBuilderPort` + `DatabasePort` → SQLite adapters.

Wiring:
- `DatabaseModule.forRoot()` is a dynamic module that binds two `Symbol` injection
  tokens, `DATABASE_CONNECTOR` and `SQL_BUILDER` (in `database.tokens.ts`), to adapters
  chosen by `process.env.DB_TYPE`, and exports both tokens.
- It's global and imported once, in `AppModule`, so the whole app shares one adapter
  instance and one connection. Feature modules don't import it.
- `DB_TYPE` unset or `sqlite`: SQLite adapters (the default). `DB_TYPE=postgres`:
  PostgreSQL adapters (not built yet).
- Any `DB_TYPE` without a valid adapter (a typo, or `postgres` before its adapter
  exists) throws, and the app doesn't start.
- Note: TypeScript interfaces don't exist at runtime, which is why the ports are bound
  to tokens.

Startup and shutdown:
- The SQLite `DatabasePort` adapter does its setup in `onModuleInit`: it creates the
  `.data/` folder if it's missing, opens the database file (`better-sqlite3` creates the
  file if it doesn't exist), runs `PRAGMA foreign_keys = ON`, and creates the tables.
  Each dialect's adapter owns its own table definitions (`sqlite/sqlite-schema.ts`).
- `.data/` is resolved from the folder the app is started in (the repo root).
- `onModuleDestroy` closes the connection.
- The adapter's methods stay `async` even though `better-sqlite3` is synchronous, so
  every failure reaches callers as a rejected promise, as with an async driver. ESLint's
  `require-await` is turned off around those methods for that reason.

Testing:
- Unit tests only for now; integration tests come later.
- Service specs mock the repositories. Repository specs mock the ports.
- Example: `ExpenseService` with an account that doesn't exist → the fake
  `AccountRepository` returns `undefined` → expect a not-found error, and the insert is
  never called.
- Accepted risk: no automated test runs the generated SQL against a real database, so
  the schema constraints stay unverified until integration tests exist.

**Scope.**
- A `src/database/` module (the dynamic database module) that provides `DatabasePort` and
  `SqlBuilderPort` and their SQLite adapters.
- The database file is `.data/finance.db`. Create the `.data/` folder if it doesn't
  exist.
- Run `PRAGMA foreign_keys = ON` when the connection opens. SQLite turns foreign keys
  off by default.
- Create all tables at startup with `CREATE TABLE IF NOT EXISTS`:
  - `category`: `id INTEGER PRIMARY KEY`, `name TEXT NOT NULL`,
    `transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Expense','Income','Transfer'))`,
    `is_default INTEGER NOT NULL DEFAULT 0`, `created_at`, `updated_at`,
    `UNIQUE (name, transaction_type)`
  - `account`: `id INTEGER PRIMARY KEY`, `name TEXT NOT NULL`,
    `account_type TEXT NOT NULL CHECK (account_type IN ('Checking','Saving','Investment','Credit'))`,
    `opening_balance_cents INTEGER NOT NULL DEFAULT 0 CHECK (opening_balance_cents >= 0)`,
    `created_at`, `updated_at`
  - `"transaction"`: `id INTEGER PRIMARY KEY`,
    `type TEXT NOT NULL CHECK (type IN ('Expense','Income','Transfer'))`,
    `date TEXT NOT NULL` (`YYYY-MM-DD`),
    `amount_cents INTEGER NOT NULL CHECK (amount_cents > 0)`, `note TEXT`,
    `category_id INTEGER NOT NULL REFERENCES category(id)`, `vendor TEXT`,
    `source TEXT`, `account_from INTEGER REFERENCES account(id)`,
    `account_to INTEGER REFERENCES account(id)`, `created_at`, `updated_at`
  - `budget`: `id INTEGER PRIMARY KEY`, `name TEXT NOT NULL`,
    `start_date TEXT NOT NULL`, `end_date TEXT NOT NULL`,
    `CHECK (end_date >= start_date)`, `created_at`, `updated_at`
  - `budget_item`: `id INTEGER PRIMARY KEY`,
    `budget_id INTEGER NOT NULL REFERENCES budget(id) ON DELETE CASCADE`,
    `category_id INTEGER NOT NULL REFERENCES category(id)`,
    `limit_cents INTEGER NOT NULL CHECK (limit_cents >= 0)`, `created_at`,
    `updated_at`, `UNIQUE (budget_id, category_id)`
- `created_at` and `updated_at` are `TEXT NOT NULL`, stored as ISO 8601 in UTC
  (for example `2026-10-07T14:30:00Z`).
- `transaction` is an SQL keyword. Always quote it in SQL: `"transaction"`.
- Every SQL statement uses `?` placeholders. Never build SQL by joining strings with
  input values.
- Budget spent and account balance are **not** stored. They're calculated on read
  (issues 08 and 09).

**Out of scope:** `runInTransaction` (deferred; Phase 1 writes are single-row),
migrations, the PostgreSQL adapters, integration tests, repositories, and any feature
module's queries (each module adds its own repository and the `SqlBuilderPort` methods it
needs in its own issue).

## Acceptance Criteria

- [x] The persistence design has been decided by the project owner and is written down
      in this issue before implementation starts.
- [x] Starting the app creates `.data/` and `.data/finance.db` if they're missing.
- [x] Restarting the app keeps existing data and doesn't fail because the tables
      already exist.
- [x] The `CREATE TABLE` statements define all five tables with the columns and
      constraints listed above.
- [x] With `DB_TYPE` unset, the SQLite adapters are bound to `DATABASE_CONNECTOR` and
      `SQL_BUILDER`.
- [x] With `DB_TYPE` set to a value that has no adapter (for example `postgres` or
      `sqlit`), the app fails to start with a clear error.
- [x] Tests pass (`npm test`). `database.module.spec.ts` covers the `DB_TYPE` binding and
      both failure cases. It builds the module without starting it, so no test opens a
      real database.

**Deferred until integration tests exist** (accepted risk): `PRAGMA foreign_keys`
returns `1`; inserting a transaction with a missing `category_id` fails; inserting
`type = 'Expence'` fails the `CHECK`; deleting a budget deletes its budget items. A
one-off manual script confirmed all four on 2026-10-08, but no automated test covers
them.
