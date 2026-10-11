# 07 — Transfer transactions (CRUD)

## Description

**Context.** A transfer moves money between two of your own accounts, such as checking
to savings or paying off a credit card. It counts as neither money in nor money out.
It's stored in the `transaction` table with `type = 'Transfer'` and reuses the
`Transaction` base class and row mapper from issue 05. A transfer has both a
from-account and a to-account.

**Depends on:** 05 (Expense, which introduces the `Transaction` base class and the
mapper), 03 (Category), 04 (Account).

**Scope.**
- `transfer/`: a `Transfer` entity that extends `Transaction` and adds `accountFrom`
  and `accountTo`.
- Add the `Transfer` case to the `transaction/` row mapper.
- `transfer/`: DTOs, a controller, and a service.
- Endpoints: `POST /transfers`, `GET /transfers`, `GET /transfers/:id`,
  `PATCH /transfers/:id`, `DELETE /transfers/:id`.
- Business rules:
  - `date`, `amount`, `categoryId`, `accountFrom`, and `accountTo` are required.
    `note` is optional.
  - `date` is `YYYY-MM-DD`. `amount` must be greater than 0.
  - The category must exist and have `transaction_type = 'Transfer'`.
  - Both accounts must exist, and `accountFrom` and `accountTo` must be different
    accounts.
  - Dollars in the API, integer cents in storage, rounded to the nearest cent.
- Saving a transfer writes only the transfer row.

**Out of scope:** account balance (issue 08), filtering and pagination, and
authentication.

## Acceptance Criteria

- [ ] `POST /transfers` with a valid body returns `201` and the created transfer,
      including its `id`.
- [ ] The stored row has `type = 'Transfer'`, the amount in cents, and `NULL` for
      `vendor` and `source`.
- [ ] `POST /transfers` returns `400` when `amount` is 0 or negative, when `date`
      isn't `YYYY-MM-DD`, when the category's `transaction_type` isn't `Transfer`,
      when the category or either account doesn't exist, or when `accountFrom` equals
      `accountTo`.
- [ ] `GET /transfers` returns only transfer transactions.
- [ ] `GET /transfers/:id` returns `404` for a missing id, and for an id that belongs
      to an expense or income.
- [ ] `PATCH /transfers/:id` updates only the fields sent, re-checks the business
      rules (including the different-accounts rule), and changes `updated_at`.
- [ ] `DELETE /transfers/:id` returns `204`, and a later `GET` of that id returns
      `404`.
- [ ] Unit tests pass (`npm test`): `TransferService` business rules with mocked
      repositories, and the mapper's `Transfer` case.
- [ ] Manual check: all five endpoints work from an HTTP client against the real SQLite
      database.
