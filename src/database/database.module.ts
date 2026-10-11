import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DATABASE_CONNECTOR, SQL_BUILDER } from './database.tokens';
import { SqliteDatabaseAdapter } from './sqlite/sqlite-database.adapter';
import { SqliteSqlBuilderAdapter } from './sqlite/sqlite-sql-builder.adapter';

@Module({})
export class DatabaseModule {
    /**
     * Binds DATABASE_CONNECTOR and SQL_BUILDER to the adapters for process.env.DB_TYPE.
     * Import once, in AppModule: the module is global, so every module shares one connection.
     */
    static forRoot(): DynamicModule {
        return {
            module: DatabaseModule,
            global: true,
            providers: providersFor(process.env.DB_TYPE),
            exports: [DATABASE_CONNECTOR, SQL_BUILDER],
        };
    }
}

function providersFor(dbType: string | undefined): Provider[] {
    switch (dbType) {
        case undefined:
        case 'sqlite':
            return [
                {
                    provide: DATABASE_CONNECTOR,
                    useClass: SqliteDatabaseAdapter,
                },
                { provide: SQL_BUILDER, useClass: SqliteSqlBuilderAdapter },
            ];
        case 'postgres':
            throw new Error(
                'DB_TYPE=postgres: the PostgreSQL adapters are not built yet.',
            );
        default:
            throw new Error(
                `Unknown DB_TYPE "${dbType}". Leave it unset or use "sqlite".`,
            );
    }
}
