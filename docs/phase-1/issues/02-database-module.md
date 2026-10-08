# 02 — Database module and SQLite adapter

## Description

**Context.** finance-api uses the Port/Adapter pattern for persistence. Services
depend on a `DatabasePort` interface, never on SQLite directly, so a PostgreSQL
adapter can replace SQLite later. Phase 1 uses SQLite through `better-sqlite3` with
raw, parameterized SQL. Every later module stores its data through this module.

**Depends on:** 01 (project setup).

**⚠ Open decision. Make it before implementing.** The *shape* of `DatabasePort` hasn't
been designed yet. This decision belongs to the project owner, so don't choose it for
them. Questions to settle:
- Is there one general port with low-level methods (run a SQL statement, fetch rows),
  or a port per module (for example, a category repository port)?
- Where do the SQL statements live: inside the SQLite adapter, or in each module?
  This decides how much code must be rewritten for PostgreSQL later.
- What will a mocked port look like in unit tests?
- Note: TypeScript interfaces don't exist at runtime, so NestJS can't inject by
  interface. The adapter must be registered under an injection token, or the port
  must be an abstract class.

**Scope.**
- A `persistence/` module that provides the `DatabasePort` and its SQLite adapter.
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
    `account_type TEXT NOT NULL CHECK (account_type IN ('Checking','Saving','Investment','Credit Card'))`,
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
migrations, the PostgreSQL adapter, and any feature module's queries (each module adds
its own in its issue, following the port design chosen above).

## Acceptance Criteria

- [ ] The `DatabasePort` shape has been decided by the project owner and is written
      down in this issue before implementation starts.
- [ ] Starting the app creates `.data/finance.db` if it's missing.
- [ ] Restarting the app keeps existing data and doesn't fail because the tables
      already exist.
- [ ] All five tables exist with the columns and constraints listed above.
- [ ] `PRAGMA foreign_keys` returns `1` on the app's connection.
- [ ] Inserting a transaction with a `category_id` that doesn't exist fails.
- [ ] Inserting a transaction with `type = 'Expence'` (a typo) fails.
- [ ] Deleting a budget also deletes its budget items.
- [ ] Tests pass (`npm test`). They cover schema creation and the constraints above,
      using an in-memory SQLite database (`:memory:`) so the real file isn't touched.
