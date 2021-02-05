import type React from 'react';
import Query, { QueryData, QueryInternals } from './Query';

const buildKey = (label: string, db: string) => `label:${label} db:${db}`;

export default class SavedQueries {
  private queries: Map<string, Query>;
  private setState?: (value: React.SetStateAction<SavedQueries>) => void;
  private internalSelected?: Query;

  /**
   * Creates storage for saved queries in app. Abstracts operations and ensures
   * immutability. Can be hooked to state updater function to automatically
   * update state after modifying operations (see .hookStateUpdater) 
   */
  constructor(
    keyValPairs?: Iterable<[string, Query]>,
    updater?: (value: React.SetStateAction<SavedQueries>) => void,
    selected?: Query
  ) {
    this.queries = keyValPairs ? new Map(keyValPairs) : new Map();
    this.setState = updater;
    this.internalSelected = selected;
  }

  updateHookedState() {
    if (!this.setState) return;
    this.setState(
      new SavedQueries(
        this.queries.entries(),
        this.setState,
        this.internalSelected
      )
    );
  }

  /**
   * Get Query object from label and database name
   */
  get(keyOrLabel: string, db: string) {
    return this.queries.get(buildKey(keyOrLabel, db));
  }

  set(label: string, db: string, query: QueryData & QueryInternals) {
    this.queries.set(buildKey(label, db), new Query(query, this));
    this.updateHookedState();
  }

  /**
   * PRIVATE! DO NOT USE OUTSIDE OF SavedQueries or Query classes
   * deletes query without triggering state update
   */
  lazyDelete(label: string, db: string) {
    this.deselect(label, db);
    this.queries.delete(buildKey(label, db));
  }

  /**
   * Remove query from saved list
   */
  delete(label: string, db: string) {
    this.deselect(label, db);
    this.queries.delete(buildKey(label, db));
    this.updateHookedState();
  }

  select(label: string, db: string) {
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
   * Create new query from QueryData
   */
  create(queryData: QueryData) {
    this.queries.set(
      buildKey(queryData.label, queryData.db),
      new Query(queryData, this)
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
