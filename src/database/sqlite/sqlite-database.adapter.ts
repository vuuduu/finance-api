import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Database, { RunResult } from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabasePort, SqlParam } from '../ports/database.port';
import { SQLITE_SCHEMA } from './sqlite-schema';

// Resolved from the folder the app is started in (the repo root with `npm run ...`).
const DATA_DIR = join(process.cwd(), '.data');
const DB_FILE = join(DATA_DIR, 'finance.db');

@Injectable()
export class SqliteDatabaseAdapter
    implements DatabasePort, OnModuleInit, OnModuleDestroy
{
    // The `!` tells TypeScript this is assigned later (in onModuleInit), not in the constructor.
    private db!: Database.Database;

    // NestJS calls this once, after the module is created and before the app accepts requests.
    onModuleInit(): void {
        // better-sqlite3 creates a missing file, but not a missing folder.
        mkdirSync(DATA_DIR, { recursive: true });
        this.db = new Database(DB_FILE);
        // SQLite turns foreign keys off by default, per connection.
        this.db.pragma('foreign_keys = ON');
        this.db.exec(SQLITE_SCHEMA);
    }

    // NestJS calls this on shutdown (including watch-mode restarts).
    onModuleDestroy(): void {
        this.db?.close();
    }

    // better-sqlite3 is synchronous, so these methods have nothing to await. They stay
    // async so that every failure reaches callers as a rejected promise, the same way
    // an async driver (PostgreSQL) behaves behind DatabasePort.
    /* eslint-disable @typescript-eslint/require-await */
    async insert(sql: string, params: SqlParam[]): Promise<number> {
        const result: RunResult = this.db.prepare(sql).run(...params);
        return Number(result.lastInsertRowid);
    }

    async run(sql: string, params: SqlParam[]): Promise<number> {
        const result: RunResult = this.db.prepare(sql).run(...params);
        return result.changes;
    }

    async get(sql: string, params: SqlParam[]): Promise<unknown> {
        return this.db.prepare(sql).get(...params);
    }

    async all(sql: string, params: SqlParam[]): Promise<unknown[]> {
        return this.db.prepare(sql).all(...params);
    }
    /* eslint-enable @typescript-eslint/require-await */
}
