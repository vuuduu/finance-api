# 09 — Budget and budget items (CRUD, spent calculated on read)

## Description

**Context.** A budget is a plan for a period of time. It sets aside a limit per expense
category, and shows how much has been spent against each limit. Spent isn't stored.
It's calculated from expense transactions whenever a budget is read, so it never drifts
out of sync. Budgets can overlap: an "October" budget and a "mid-October to
mid-November" budget can both count the same grocery expense, because each one
tells its own story about its own period.

**Depends on:** 03 (Category), 05 (Expense).

**Scope.**
- A `budget/` module with `Budget` and `BudgetItem` entities, DTOs, controllers, and a
  service.
- Budget endpoints: `POST /budgets`, `GET /budgets`, `GET /budgets/:id`,
  `PATCH /budgets/:id`, `DELETE /budgets/:id`.
- Budget item endpoints: `POST /budgets/:id/items`, `GET /budgets/:id/items`,
  `PATCH /budgets/:id/items/:itemId`, `DELETE /budgets/:id/items/:itemId`.
- Budget fields: `name`, `startDate`, and `endDate` (all required, dates in
  `YYYY-MM-DD`). `endDate` must not be before `startDate`.
- Budget item fields: `categoryId` and `limit` (in dollars, 0 or more, stored as
  integer cents).
- Business rules:
  - An item's category must exist and have `transaction_type = 'Expense'`.
  - A budget can have only one item per category.
  - Deleting a budget deletes its items.
- Reading a budget or its items returns, for each item: `limit`, `spent`, and
  `remaining`. `remaining` is `limit − spent`, and a negative value means over budget.
- `spent` = the `SUM` of `Expense` transactions with that item's category, where the
  date is between the budget's `startDate` and `endDate`, inclusive on both ends.
  Calculate it in SQL. Income and transfers never count.
- Budgets may overlap. Each one calculates its own spent independently.
- Creating, editing, or deleting expenses doesn't touch budgets. The next read reflects
  the change.

**Out of scope:** the monthly net report (Phase 2), budget templates and recurring
budgets, and authentication.

## Acceptance Criteria

- [ ] `POST /budgets` with a valid body returns `201`. It returns `400` when a field is
      missing, a date isn't `YYYY-MM-DD`, or `endDate` is before `startDate`.
- [ ] `POST /budgets/:id/items` returns `201`. It returns `400` for an Income or
      Transfer category, or for a negative limit, and `409` for a category already in
      that budget.
- [ ] For a budget from `2026-10-01` to `2026-10-31` with a Groceries limit of `400.00`,
      grocery expenses of `30.00` on `2026-10-01` and `20.00` on `2026-10-31` give
      `spent: 50.00` and `remaining: 350.00`.
- [ ] A grocery expense on `2026-11-01` isn't counted in that October budget.
- [ ] An item with no matching expenses shows `spent: 0.00` and `remaining` equal to
      its limit.
- [ ] Spending over the limit returns a negative `remaining`.
- [ ] Two overlapping budgets that include the same category both count an expense
      that falls inside both periods.
- [ ] Income transactions never affect `spent`.
- [ ] `DELETE /budgets/:id` returns `204` and removes its items.
- [ ] Unit tests pass (`npm test`): `BudgetService` business rules and the
      spent/remaining logic (including both date boundaries and overlapping budgets),
      with a mocked `DatabasePort`.
- [ ] Manual check: from Postman, create the budget and expenses in the examples above
      and confirm the numbers.
