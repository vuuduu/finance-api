// Repositories describe queries through this port; each dialect's adapter returns
// the raw SQL. It starts empty in issue 02 and grows as repositories need queries
// (for example, a method for "insert a category" arrives with issue 03).
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- empty until issue 03 adds its first method
export interface SqlBuilderPort {}
