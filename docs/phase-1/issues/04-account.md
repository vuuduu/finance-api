# 04 — Account (CRUD, no balance yet)

## Description

**Context.** Accounts are where money lives: checking, savings, investment accounts
(brokerage, IRA, HSA), and credit cards. Transactions point to accounts: an expense
comes *from* an account, income goes *to* one, and a transfer has both. Accounts
must exist before transactions can reference them, so this issue builds account
create, read, update, and delete. The balance is calculated from transactions, so it
comes later, in issue 08, once transactions exist.

**Depends on:** 02 (database module and `account` table).

**Scope.**
- An `account/` module with an `Account` entity, DTOs, a controller, and a service.
- Endpoints: `POST /accounts`, `GET /accounts`, `GET /accounts/:id`,
  `PATCH /accounts/:id`, `DELETE /accounts/:id`.
- Fields:
  - `name` (required)
  - `accountType` (required): `Checking`, `Saving`, `Investment`, or `Credit Card`
  - `openingBalance`: in dollars, 0 or more, defaulting to 0. Stored as integer cents
    in `opening_balance_cents`, rounded to the nearest cent.
- All balances are positive by convention. A credit card's opening balance is the
  amount owed.
- An account that any transaction uses (as `account_from` or `account_to`) can't be
  deleted.
- Responses don't include a `balance` field yet. Issue 08 adds it.

**Out of scope:** the calculated balance (issue 08), `opening_date` (Phase 2), market
value for investment accounts (finance-api tracks cash flow only), and
authentication.

## Acceptance Criteria

- [ ] `POST /accounts` with a valid body returns `201` and the created account,
      including its `id`.
- [ ] `openingBalance: 300.10` is stored as `opening_balance_cents = 30010`, and
      returned as `300.10`.
- [ ] `openingBalance` defaults to `0` when it isn't sent.
- [ ] `POST /accounts` returns `400` when `name` is missing, when `accountType` isn't
      one of the four allowed values, or when `openingBalance` is negative.
- [ ] `GET /accounts` lists all accounts. `GET /accounts/:id` returns `404` for a
      missing id.
- [ ] `PATCH /accounts/:id` updates only the fields sent and changes `updated_at`.
- [ ] `DELETE /accounts/:id` returns `204`, or `409` if a transaction uses the
      account.
- [ ] Unit tests pass (`npm test`): `AccountService` business rules with a mocked
      `DatabasePort`, and the dollars-to-cents conversion.
- [ ] Manual check: all endpoints work from Postman against the real SQLite database.
