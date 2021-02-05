import type SavedQueries from './SavedQueries';

export interface QueryData {
  sqlString?: string;
  returnedRows?: Record<string, any>[];
  explainJson?: any;
  /**
   * Name of PG database that this query is run on
   */
  db: string;
  /**
   * User given label that identifies query
   */
  label: string;
}

export interface QueryInternals {
  shouldCompare?: boolean
}

export default class Query {
  storage: SavedQueries;

  shouldCompare?: boolean;

  sqlString?: string;
  returnedRows?: Record<string, any>[];
  explainJson?: any;
  db: string;
  label: string;

  constructor(query: QueryData & QueryInternals, storage: SavedQueries) {
    this.storage = storage;

    this.label = query.label;
    this.db = query.db;
    this.explainJson = query.explainJson;
    this.returnedRows = query.returnedRows;
    this.sqlString = query.sqlString;

    this.shouldCompare = query.shouldCompare || false;
  }

  delete() {
    this.storage.delete(this.label, this.db);
  }

  toggleCompare() {
    this.shouldCompare = !this.shouldCompare;
    this.storage.updateHookedState()
  }

  update(partialQuery: Partial<QueryData>) {
    this.storage.lazyDelete(this.label, this.db)
    this.storage.set(this.label, this.db, {
      label: this.label,
      db: this.db,
      explainJson: this.explainJson,
      returnedRows: this.returnedRows,
      sqlString: this.sqlString,
      shouldCompare: this.shouldCompare,
      ...partialQuery,
    });
  }

  select() {
    this.storage.select(this.label, this.db)
  }

  get isSelected() {
    return this.storage.selected === this
  }
}
