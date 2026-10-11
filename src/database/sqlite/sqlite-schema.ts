// Table definitions for SQLite. The SQLite database adapter runs this with db.exec()
// at startup. IF NOT EXISTS makes it safe to run on every start.
// Column lists and constraints: docs/phase-1/issues/02-database-module.md
export const SQLITE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS category (
        id               INTEGER PRIMARY KEY,
        name             TEXT    NOT NULL,
        transaction_type TEXT    NOT NULL CHECK (transaction_type IN ('Expense', 'Income', 'Transfer')),
        is_default       INTEGER NOT NULL DEFAULT 0,
        created_at       TEXT    NOT NULL,
        updated_at       TEXT    NOT NULL,
        UNIQUE (name, transaction_type)
    );

    CREATE TABLE IF NOT EXISTS account (
        id                    INTEGER PRIMARY KEY,
        name                  TEXT    NOT NULL,
        account_type          TEXT    NOT NULL CHECK (account_type IN ('Checking', 'Saving', 'Investment', 'Credit')),
        opening_balance_cents INTEGER NOT NULL DEFAULT 0 CHECK (opening_balance_cents >= 0),
        created_at            TEXT    NOT NULL,
        updated_at            TEXT    NOT NULL
    );

    -- "transaction" is quoted because transaction is an SQL keyword
    CREATE TABLE IF NOT EXISTS "transaction" (
        id            INTEGER PRIMARY KEY,
        type          TEXT    NOT NULL CHECK (type IN ('Expense', 'Income', 'Transfer')),
        date          TEXT    NOT NULL, -- YYYY-MM-DD
        amount_cents  INTEGER NOT NULL CHECK (amount_cents > 0),
        note          TEXT,
        category_id   INTEGER NOT NULL REFERENCES category(id),
        vendor        TEXT,
        source        TEXT,
        account_from  INTEGER REFERENCES account(id),
        account_to    INTEGER REFERENCES account(id),
        created_at    TEXT    NOT NULL,
        updated_at    TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budget (
        id         INTEGER PRIMARY KEY,
        name       TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date   TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        CHECK (end_date >= start_date)
    );

    CREATE TABLE IF NOT EXISTS budget_item (
        id          INTEGER PRIMARY KEY,
        budget_id   INTEGER NOT NULL REFERENCES budget(id) ON DELETE CASCADE,
        category_id INTEGER NOT NULL REFERENCES category(id),
        limit_cents INTEGER NOT NULL CHECK (limit_cents >= 0),
        created_at  TEXT    NOT NULL,
        updated_at  TEXT    NOT NULL,
        UNIQUE (budget_id, category_id)
    );
`;
