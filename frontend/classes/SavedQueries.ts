/**
 * This file declares the class that is used as the storage solution for queries on the app
 * SavedQueries is designed to be set as the state of a React component and to then receive a 
 * reference to the hook that updates that state. This ensures this instance is capable of updating
 * the component's state at the end of any modifying operations.
 * All operations that create, update or delete a query MUST call .updateHookedState in order for the
 * component to be updated and a re-render be triggered if needed.
 */

// Disable these rules since Query must be declared inside SavedQueries in order
// to have access to it's private/protected properties.

/* eslint-disable max-classes-per-file, no-redeclare, import/export */

import type React from 'react';

export interface QueryData {
  /**
   * SQL string as inputted by user
   */
  sqlString?: string;
  /**
   * pg rows returned from running query on db. 
   */
  returnedRows?: Record<string, any>[];
  /**
   * Execution Plan. Result of running EXPLAIN (FORMAT JSON, ANALYZE)
   */
  executionPlan?: any;
  /**
   * Name of PG database that this query is run on
   */
  db: string;
  /**
   * User given label that identifies query
   */
  label: string;
}

interface QueryInternals {
  shouldCompare?: boolean
}

const buildKey = (label: string, db: string) => `label:${label} db:${db}`;

export class SavedQueries {
  private queries: Map<string, SavedQueries.Query>;
  private setState?: (value: React.SetStateAction<SavedQueries>) => void;
  private internalSelected?: SavedQueries.Query;

  /**
   * Creates storage for saved queries in app. Abstracts operations and ensures
   * immutability. Can be hooked to state updater function to automatically
   * update state after modifying operations (see .hookStateUpdater)
   */
  constructor(
    keyValPairs?: Iterable<[string, SavedQueries.Query]>,
    updater?: (value: React.SetStateAction<SavedQueries>) => void,
    selected?: SavedQueries.Query
  ) {
    this.queries = keyValPairs ? new Map(keyValPairs) : new Map();
    this.setState = updater;
    this.internalSelected = selected;
  }

  /**
   * User Query with data and methods to operate on itself. Belongs to a SavedQueries instance
   */
  // This class is declared here in order to have access to SavedQueries private
  // members. This ensures only the methods and properties designed to be
  // directly manipulated outside this file are accessible.
  static Query = class Query {
    private storage: SavedQueries;

    private shouldCompare: boolean;

    sqlString?: string;
    returnedRows?: Record<string, any>[];
    executionPlan?: any;
    db: string;
    label: string;

    constructor(query: QueryData & QueryInternals, storage: SavedQueries) {
      this.storage = storage;

      this.label = query.label;
      this.db = query.db;
      this.executionPlan = query.executionPlan;
      this.returnedRows = query.returnedRows;
      this.sqlString = query.sqlString;
      

      this.shouldCompare = query.shouldCompare || false;
    }

    /**
     * Deletes this Query from the Saved Queries storage
     */
    delete() {
      this.storage.delete(this.label, this.db);
    }

    /**
     * Toggle compare flag for this Query. 
     * Compare flag indicates whether a Query should be shown on Compare View
     */
    toggleCompare() {
      this.shouldCompare = !this.shouldCompare;
      this.storage.updateHookedState();
    }

    /**
     * Update this Query. Can have any of it's properties overwritten.
     * In case of a .label update, deletes previous Query and creates new one with new name
     */
    update(partialQuery: Partial<QueryData>) {
      this.storage.lazyDelete(this.label, this.db);
      this.storage.set(this.label, this.db, {
        label: this.label,
        db: this.db,
        executionPlan: this.executionPlan,
        returnedRows: this.returnedRows,
        sqlString: this.sqlString,
        shouldCompare: this.shouldCompare,
        ...partialQuery,
      });
    }

    /** 
     * Set this Query selected on SavedQueries. Deselects previously selected Query if any
     */
    select() {
      this.storage.select(this.label, this.db);
    }

    get isSelected() {
      return this.storage.selected === this;
    }

    get isCompared() {
      return this.shouldCompare
    }
  };

  /** PRIVATE METHODS */

  private updateHookedState() {
    if (!this.setState) return;
    this.setState(
      new SavedQueries(
        this.queries.entries(),
        this.setState,
        this.internalSelected
      )
    );
  }

  private set(label: string, db: string, query: QueryData & QueryInternals) {
    this.queries.set(buildKey(label, db), new SavedQueries.Query(query, this));
    this.updateHookedState();
  }

  /**
   * deletes query without triggering state update
   */
  private lazyDelete(label: string, db: string) {
    this.deselect(label, db);
    this.queries.delete(buildKey(label, db));
  }

  /**
   * Remove query from saved list
   */
  private delete(label: string, db: string) {
    this.deselect(label, db);
    this.queries.delete(buildKey(label, db));
    this.updateHookedState();
  }

  private select(label: string, db: string) {
    this.internalSelected = this.queries.get(buildKey(label, db));
    this.updateHookedState();
  }

  private deselect(label: string, db: string) {
    if (
      this.internalSelected &&
      buildKey(this.internalSelected.label, this.internalSelected.db) ===
        buildKey(label, db)
    )
      this.internalSelected = undefined;
  }

  /** PUBLIC METHODS */

  /**
   * Get Query object from label and database name
   */
  get(keyOrLabel: string, db: string) {
    return this.queries.get(buildKey(keyOrLabel, db));
  }

  /**
   * Store reference to state updater function that is used to update SavedQueries
   * This updater will be called with a new instance of SavedQueries whenever a modifying operation is executed
   */
  hookStateUpdater(
    updater: (value: React.SetStateAction<SavedQueries>) => void
  ) {
    // on updates the SavedQueries instance is initialized with this.setState,
    // so this function default to using that instead of overwriting with a new
    // function
    this.setState = this.setState || updater;
  }

  /**
   * Returns array of all queries currently saved
   */
  list() {
    return [...this.queries.values()];
  }

  /**
   * Create new query from QueryData and select it
   */
  create(queryData: QueryData) {
    this.queries.set(
      buildKey(queryData.label, queryData.db),
      new SavedQueries.Query(queryData, this)
    );
    // this.select updates state so not needed here
    this.select(queryData.label, queryData.db);
  }

  /**
   * Deselect all queries
   * Changes State on App component
   */
  deselectAll() {
    this.internalSelected = undefined;
    this.updateHookedState();
  }

  /**
   * Getter for number of saved queries
   */
  get length() {
    return this.queries.size;
  }

  /**
   * Getter for currently user selected Query.
   */
  get selected() {
    // Prevents selected from being manipulated from outside of this class
    return this.internalSelected;
  }
}

// This is necessary in order to export the inner class Query type in a friendlier manner.
// This way the Query type can be accessed via SavedQueries.Query instead of InstanceType<typeof SavedQueries.Query>
// see https://github.com/microsoft/TypeScript/issues/30183
export namespace SavedQueries {
  export type Query = InstanceType<typeof SavedQueries.Query>;
}
