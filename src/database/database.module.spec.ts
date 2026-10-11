import { Test } from '@nestjs/testing';
import { DatabaseModule } from './database.module';
import { DATABASE_CONNECTOR, SQL_BUILDER } from './database.tokens';
import { SqliteDatabaseAdapter } from './sqlite/sqlite-database.adapter';
import { SqliteSqlBuilderAdapter } from './sqlite/sqlite-sql-builder.adapter';

describe('DatabaseModule', () => {
    const originalDbType = process.env.DB_TYPE;

    afterEach(() => {
        if (originalDbType === undefined) {
            delete process.env.DB_TYPE;
        } else {
            process.env.DB_TYPE = originalDbType;
        }
    });

    it('binds both tokens to the SQLite adapters when DB_TYPE is unset', async () => {
        delete process.env.DB_TYPE;

        // compile() builds the module without calling onModuleInit, so no database file is opened.
        const moduleRef = await Test.createTestingModule({
            imports: [DatabaseModule.forRoot()],
        }).compile();

        expect(moduleRef.get(DATABASE_CONNECTOR)).toBeInstanceOf(
            SqliteDatabaseAdapter,
        );
        expect(moduleRef.get(SQL_BUILDER)).toBeInstanceOf(
            SqliteSqlBuilderAdapter,
        );
    });

    it('throws for DB_TYPE=postgres until its adapters exist', () => {
        process.env.DB_TYPE = 'postgres';

        expect(() => DatabaseModule.forRoot()).toThrow('not built yet');
    });

    it('throws for an unknown DB_TYPE', () => {
        process.env.DB_TYPE = 'sqlit';

        expect(() => DatabaseModule.forRoot()).toThrow(
            'Unknown DB_TYPE "sqlit"',
        );
    });
});
