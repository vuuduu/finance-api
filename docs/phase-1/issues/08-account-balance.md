# 08 — Account balance (calculated on read)

## Description

**Context.** finance-api doesn't store account balances. Like a spreadsheet, it
calculates every balance from the transactions whenever an account is read, so the
balance can never drift out of sync. Balances are positive by convention. For a credit
card, the balance is the amount owed, so its formula is inverted.

**Depends on:** 04 (Account), 05 (Expense), 06 (Income), 07 (Transfer).

**Scope.**
- `GET /accounts` and `GET /accounts/:id` include a calculated `balance`, in dollars.
- Balance formulas, using all transaction types:
  - **Checking, Saving, Investment:**
    `opening_balance + SUM(amount where account_to = this account) − SUM(amount where account_from = this account)`
  - **Credit:**
    `opening_balance + SUM(amount where account_from = this account) − SUM(amount where account_to = this account)`.
    Spending on the card increases the amount owed. A payment transfer to the card
    reduces it.
- Calculate in SQL, using a `SUM` over the `transaction` table, not by loading every
  transaction into memory.
- A balance may go below zero, for example an overdrawn checking account or an overpaid
  credit card. That's allowed and isn't an error.
- Investment accounts track cash flow only: deposits, withdrawals, and transfers. Market
  growth isn't tracked.

**Out of scope:** `opening_date` (Phase 2), market value, net worth, and the monthly
net report (Phase 2).

## Acceptance Criteria

- [ ] A checking account with an opening balance of `1000.00`, `200.00` of income to
      it, and a `50.00` expense from it shows `balance: 1150.00`.
- [ ] A credit card with an opening balance of `300.00` (owed), a `50.00` expense
      charged to it, and a `200.00` transfer from checking to it shows
      `balance: 150.00`. The checking account's balance drops by `200.00`.
- [ ] An account with no transactions shows its opening balance.
- [ ] Creating, editing, or deleting a transaction changes the balances on the next
      read, with no other step needed.
- [ ] A balance below zero is returned as a negative number without an error.
- [ ] Unit tests pass (`npm test`): the balance logic for each account type, including
      the two examples above, with mocked repositories.
- [ ] Manual check: from an HTTP client, create the transactions in the examples above and
      confirm the balances.
