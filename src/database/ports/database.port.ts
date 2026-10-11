/** A value that fills one `?` placeholder. `null` stores SQL NULL (for example, an empty note). */
export type SqlParam = string | number | null;

export interface DatabasePort {
    /** Insert one row. Returns the new row's id. */
    insert(sql: string, params: SqlParam[]): Promise<number>;

    /** Update or delete. Returns how many rows changed. */
    run(sql: string, params: SqlParam[]): Promise<number>;

    /** Read one row from the database */
    get(sql: string, params: SqlParam[]): Promise<unknown>;

    /** Read many rows from the database */
    all(sql: string, params: SqlParam[]): Promise<unknown[]>;
}
