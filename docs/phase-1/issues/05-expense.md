# 05 — Expense transactions (CRUD)

## Description

**Context.** finance-api is a personal finance API (NestJS + TypeScript, SQLite via
better-sqlite3, raw parameterized SQL). All money movements are stored in one
`transaction` table with a `type` column: `Expense`, `Income`, or `Transfer`. This
issue builds the first transaction type, Expense, plus the shared pieces that
Income (06) and Transfer (07) will reuse.

**Depends on:** 02 (database module and `transaction` table), 03 (Category),
04 (Account).

**Scope.**
- `transaction/`: a `Transaction` base class with the shared fields: `id`, `type`,
  `date`, `amountCents`, `note`, `categoryId`, `createdAt`, `updatedAt`.
- `transaction/`: a `TransactionRow` type (the raw SQL row shape) and a mapper that
  converts a row into the matching class based on `type`. This issue implements the
  `Expense` case only. Income and Transfer are added in their own issues.
- `expense/`: an `Expense` entity that extends `Transaction` and adds `vendor` and
  `accountFrom`.
- `expense/`: DTOs that validate incoming requests, plus a controller and a service.
- A repository for `"transaction"` rows. **Open decision for this issue:** one shared
  repository in `transaction/` used by Expense, Income, and Transfer, or one per type.
- Endpoints: `POST /expenses`, `GET /expenses`, `GET /expenses/:id`,
  `PATCH /expenses/:id`, `DELETE /expenses/:id`.
- Business rules:
  - `vendor`, `date`, `amount`, `categoryId`, and `accountFrom` are required.
    `note` is optional.
  - `date` is `YYYY-MM-DD`. `amount` must be greater than 0.
  - The category must exist and have `transaction_type = 'Expense'`.
  - The `accountFrom` account must exist.
  - The API accepts and returns dollars (`12.77`) and stores integer cents (`1277`).
    The conversion rounds to the nearest cent.
- Saving an expense writes only the expense row. Budget spent and account balance
  are calculated on read (issues 08 and 09), so this issue doesn't touch them.

**Out of scope:** Income and Transfer, filtering and pagination, budget spent,
account balance, authentication, and `runInTransaction` (deferred).

## Acceptance Criteria

- [ ] `POST /expenses` with a valid body returns `201` and the created expense,
      including its `id`, with `amount: 12.77`.
- [ ] The stored row has `type = 'Expense'`, `amount_cents = 1277`, and `NULL` for
      `source` and `account_to`.
- [ ] `POST /expenses` returns `400` when `vendor` is missing, when `amount` is 0
      or negative, when `date` isn't `YYYY-MM-DD`, when the category's
      `transaction_type` isn't `Expense`, or when the category or the `accountFrom`
      account doesn't exist.
- [ ] `GET /expenses` returns only expense transactions, never income or transfers.
- [ ] `GET /expenses/:id` returns `404` for a missing id, and for an id that belongs
      to an income or transfer.
- [ ] `PATCH /expenses/:id` updates only the fields sent, re-checks the business
      rules, and changes `updated_at`.
- [ ] `DELETE /expenses/:id` returns `204`, and a later `GET` of that id returns `404`.
- [ ] Unit tests pass (`npm test`):
  - `ExpenseService` business rules, with mocked repositories
  - The mapper: a row converts to an `Expense` and back, and `12.77` converts to
    `1277` (not `1276`).
- [ ] Manual check: all five endpoints work from an HTTP client against the real SQLite
      database.
