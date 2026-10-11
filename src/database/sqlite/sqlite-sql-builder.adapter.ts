import { Injectable } from '@nestjs/common';
import { SqlBuilderPort } from '../ports/sql-builder.port';

// Writes SQLite-flavored SQL for each SqlBuilderPort method. Empty until the port
// gets its first method.
@Injectable()
export class SqliteSqlBuilderAdapter implements SqlBuilderPort {}
