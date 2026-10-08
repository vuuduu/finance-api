# 03 — Category (CRUD and default categories)

## Description

**Context.** Every transaction in finance-api has exactly one category. One
`category` table holds categories for all three transaction types. Each category's
`transaction_type` (`Expense`, `Income`, or `Transfer`) says which kind of
transaction may use it. That lets clients filter categories by type, and lets the
transaction services reject mismatches, such as a grocery expense filed under
Salary. Default categories come pre-loaded, and users can add their own.

**Depends on:** 02 (database module and `category` table).

**Scope.**
- A `category/` module with a `Category` entity, DTOs, a controller, and a service.
- Endpoints: `POST /categories`, `GET /categories`, `GET /categories/:id`,
  `PATCH /categories/:id`, `DELETE /categories/:id`.
- `GET /categories?transactionType=Expense` returns only categories of that type.
- Business rules:
  - `name` and `transactionType` are required. `transactionType` is one of
    `Expense`, `Income`, or `Transfer`.
  - Names are unique within a transaction type. `Other` can exist once as an Expense
    category and once as an Income category.
  - A category that any transaction uses can't be deleted, and its
    `transactionType` can't be changed (either would break those transactions).
  - In Phase 1, `isDefault` only records where a category came from. Default
    categories can be renamed or deleted like any other category, subject to the
    in-use rule.
- Seed default categories at startup, inserting only the ones that are missing, with
  `is_default = 1`. Starter list (adjust freely):
  - Expense: Groceries, Dining, Housing, Utilities, Transportation, Healthcare,
    Entertainment, Shopping, Other
  - Income: Salary, Freelance, Interest, Other
  - Transfer: Credit Card Payment, Savings, Investment Contribution, Other

**Out of scope:** authentication and per-user categories.

## Acceptance Criteria

- [ ] On first start, the default categories exist with `is_default = 1`.
- [ ] Restarting the app doesn't create duplicate default categories.
- [ ] `POST /categories` with a valid body returns `201` and the created category,
      with `isDefault: false`.
- [ ] `POST /categories` returns `400` when `name` is missing or `transactionType`
      isn't one of the three allowed values.
- [ ] `POST /categories` returns `409` for a name that already exists within the same
      transaction type.
- [ ] `GET /categories?transactionType=Income` returns only income categories.
- [ ] `GET /categories/:id` returns `404` for a missing id.
- [ ] `PATCH /categories/:id` updates only the fields sent and changes `updated_at`.
- [ ] `PATCH` returns `409` when changing `transactionType` on a category that a
      transaction uses.
- [ ] `DELETE /categories/:id` returns `204`, or `409` if a transaction uses the
      category.
- [ ] Unit tests pass (`npm test`): `CategoryService` business rules with a mocked
      `DatabasePort`, and seeding that inserts only the missing defaults.
- [ ] Manual check: all endpoints work from Postman against the real SQLite database.
