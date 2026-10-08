# 06 — Income transactions (CRUD)

## Description

**Context.** Income is money coming in, such as a paycheck or freelance payment. It's
stored in the same `transaction` table as expenses, with `type = 'Income'`, and reuses
the `Transaction` base class and row mapper from issue 05. Income goes *to* an
account and records its `source`.

**Depends on:** 05 (Expense, which introduces the `Transaction` base class and the
mapper), 03 (Category), 04 (Account).

**Scope.**
- `income/`: an `Income` entity that extends `Transaction` and adds `source` and
  `accountTo`.
- Add the `Income` case to the `transaction/` row mapper.
- `income/`: DTOs, a controller, and a service.
- Endpoints: `POST /incomes`, `GET /incomes`, `GET /incomes/:id`,
  `PATCH /incomes/:id`, `DELETE /incomes/:id`.
- Business rules:
  - `source`, `date`, `amount`, `categoryId`, and `accountTo` are required. `note`
    is optional.
  - `date` is `YYYY-MM-DD`. `amount` must be greater than 0.
  - The category must exist and have `transaction_type = 'Income'`.
  - The `accountTo` account must exist.
  - Dollars in the API, integer cents in storage, rounded to the nearest cent.
- Saving income writes only the income row.

**Out of scope:** Transfer, filtering and pagination, account balance, the monthly net
report (Phase 2), and authentication.

## Acceptance Criteria

- [ ] `POST /incomes` with a valid body returns `201` and the created income,
      including its `id`.
- [ ] The stored row has `type = 'Income'`, the amount in cents, and `NULL` for
      `vendor` and `account_from`.
- [ ] `POST /incomes` returns `400` when `source` is missing, when `amount` is 0 or
      negative, when `date` isn't `YYYY-MM-DD`, when the category's
      `transaction_type` isn't `Income`, or when the category or the `accountTo`
      account doesn't exist.
- [ ] `GET /incomes` returns only income transactions.
- [ ] `GET /incomes/:id` returns `404` for a missing id, and for an id that belongs to
      an expense or transfer.
- [ ] `PATCH /incomes/:id` updates only the fields sent, re-checks the business rules,
      and changes `updated_at`.
- [ ] `DELETE /incomes/:id` returns `204`, and a later `GET` of that id returns `404`.
- [ ] The expense endpoints from issue 05 still return only expenses.
- [ ] Unit tests pass (`npm test`): `IncomeService` business rules with a mocked
      `DatabasePort`, and the mapper's `Income` case.
- [ ] Manual check: all five endpoints work from Postman against the real SQLite
      database.
