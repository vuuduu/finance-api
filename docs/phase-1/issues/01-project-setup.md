# 01 — Project setup

## Description

**Context.** finance-api is a personal finance API for tracking expenses, income,
transfers, accounts, and budgets. It's built with NestJS and TypeScript, and stores
data in SQLite. Phase 1 is a vertical build: every module is built end to end, from
HTTP to the database, and every endpoint is callable from an HTTP client. This issue
creates the empty NestJS project that every later issue builds on.

**Depends on:** nothing. This is the first issue.

**Scope.**
- Scaffold a NestJS application with npm in the repository root. The root already
  contains `.gitignore`, `docs/`, and a local `.vibe-wise/` notes folder. Keep all
  three.
- Merge the scaffold's default `.gitignore` entries (for example `node_modules/` and
  `dist/`) into the existing `.gitignore`. Don't remove the existing entries
  `.vibe-wise/` and `.data/`.
- Install `class-validator` and `class-transformer`, and register a global
  `ValidationPipe` so DTO validation runs on every request.
- Keep the scaffold's default `GET /` endpoint as a simple "the app is running"
  check.

**Out of scope:** the database, all feature modules, and authentication.

## Acceptance Criteria

- [x] `npm install` completes without errors.
- [x] `npm run start:dev` starts the app on port 3000.
- [x] `GET http://localhost:3000/` returns `200` from an HTTP client.
- [x] `npm test` passes (the scaffold's default test).
- [x] `.gitignore` contains `.vibe-wise/`, `.data/`, `node_modules/`, and `dist/`.
- [x] `git status` doesn't list `.vibe-wise/`.
- [x] A global `ValidationPipe` is registered in `main.ts`, with `whitelist: true`
      (unknown body fields are stripped) and `transform: true` (DTOs arrive as class
      instances, and route and query params are converted to their declared types).
