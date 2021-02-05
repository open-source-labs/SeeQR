import type React from 'react';
import Query, {QueryData, QueryInternals} from './Query';

const buildKey = (label: string, db: string) => `label:${label} db:${db}`;

export default class SavedQueries {
  queries: Map<string, Query>;
  setState?: (value: React.SetStateAction<SavedQueries>) => void;
  selected?: Query;

  /**
   * Creates storage for saved queries in app. Abstracts operations and ensures immutability
   */
  constructor(
    keyValPairs?: Iterable<[string, Query]>,
    updater?: (value: React.SetStateAction<SavedQueries>) => void,
    selected?: Query
  ) {
    this.queries = keyValPairs ? new Map(keyValPairs) : new Map();
    this.setState = updater;
    this.selected = selected
  }

  hookStateUpdater(
    updater: (value: React.SetStateAction<SavedQueries>) => void
  ) {
    this.setState = this.setState || updater;
  }

  updateHookedState() {
    if (!this.setState) return;
    this.setState(new SavedQueries(this.queries.entries(), this.setState, this.selected));
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
   * Returns array of queries currently saved
   */
  list() {
    return [...this.queries.values()];
  }

  /**
   * Create new empty query to be edited by user
   */
  create(label: string, db: string) {
    this.queries.set(buildKey(label, db), new Query({ label, db }, this));
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
    this.selected = this.queries.get(buildKey(label, db));
    this.updateHookedState();
  }

  deselect(label: string, db: string) {
    if (
      this.selected &&
      buildKey(this.selected.label, this.selected.db) === buildKey(label, db)
    )
      this.selected = undefined;
  }

  get length() {
    return this.queries.size
  }
}
