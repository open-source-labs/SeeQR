window.require = ((str: string) => str) as any
import * as queries from '../../../frontend/lib/queries';
import type { QueryData } from '../../../frontend/types';

const first: Partial<QueryData> = {
  label: 'firstQuery',
  db: 'firstDb',
  group: 'group1',
  sqlString: 'select * from tests',
  executionPlan: {
    Plan: {
      'Node Type': 'Seq Scan',
      'Relation Name': 'users',
      Alias: 'users',
      'Startup Cost': 0,
      'Total Cost': 0,
      'Plan Rows': 0,
      'Plan Width': 0,
      'Actual Startup Time': 0,
      'Actual Total Time': 0,
      'Actual Rows': 0,
      'Actual Loops': 0,
    },
    'Planning Time': 1,
    'Execution Time': 1,
  },
};

const second: Partial<QueryData> = {
  label: 'secondQuery',
  db: 'secondDb',
  sqlString: 'select * from users',
};

describe('key generation', () => {
  it('should create key from label and db given as params', () => {
    expect(queries.keyFromData('LABEL', 'DB', 'GROUP')).toEqual('label:LABEL db:DB group:GROUP');
  });

  it('should create key from query object', () => {
    const query = {
      label: 'query1',
      db: 'db1',
      group: 'group1'
    };
    expect(queries.key(query as QueryData)).toEqual('label:query1 db:db1 group:group1');
  });
});

describe('getTotalTime', () => {
  it('should return 0 if given undefined', () => {
    expect(queries.getTotalTime(undefined)).toBe(0);
  });

  it('should return sum of Execution Time and Planning Time', () => {
    const dummy = {
      executionPlan: {
        'Execution Time': 1000,
        'Planning Time': 2000,
      },
    };
    expect(queries.getTotalTime(dummy as QueryData)).toEqual(3000);
  });
});

describe('getPrettyTime', () => {
  it('should return undefined if given undefined', () => {
    expect(queries.getPrettyTime(undefined)).toBeUndefined();
  });

  it('should return pretty string with rounded result', () => {
    const fractional = {
      executionPlan: {
        'Execution Time': 0.2965242,
        'Planning Time': 0.785523421,
      },
    };
    expect(queries.getPrettyTime(fractional as QueryData)).toBe('1.08 ms');

    const integer = {
      executionPlan: {
        'Execution Time': 1111,
        'Planning Time': 1111,
      },
    };
    expect(queries.getPrettyTime(integer as QueryData)).toBe('2 seconds');
  });
});

describe('createQuery', () => {
  const collection: Record<string, QueryData> = {};

  it('should create new queries and return collection', () => {
    expect(Object.keys(collection).length).toBe(0);
    const newCollection = queries.createQuery(collection, first as QueryData);
    expect(Object.keys(newCollection).length).toBe(1);
    const secondNewCollection = queries.createQuery(
      newCollection,
      second as QueryData
    );
    expect(Object.keys(secondNewCollection).length).toBe(2);
  });

  it('should not mutate original collection', () => {
    expect(Object.keys(collection).length).toBe(0);
    const newCollection = queries.createQuery(collection, first as QueryData);
    expect(Object.keys(collection).length).toBe(0);
    expect(newCollection).not.toBe(collection);
  });

  it('should update query if already existing and return new collection', () => {
    const newFirst: Partial<QueryData> = {
      ...first,
      sqlString: 'drop table tests',
    };
    const initial = queries.createQuery(collection, first as QueryData);
    const updatedCollection = queries.createQuery(
      initial,
      newFirst as QueryData
    );
    expect(Object.keys(updatedCollection).length).toEqual(1);
    expect(updatedCollection[queries.key(newFirst as QueryData)]).toEqual(
      newFirst
    );
  });
});

describe('deleteQuery', () => {
  const oneQuery: Record<string, QueryData> = queries.createQuery(
    {},
    first as QueryData
  );

  const collection: Record<string, QueryData> = queries.createQuery(
    oneQuery,
    second as QueryData
  );

  it('should not mutate original collection', () => {
    expect(Object.keys(collection).length).toBe(2);
    const newCollection = queries.deleteQuery(collection, first as QueryData);
    expect(Object.keys(collection).length).toBe(2);
    expect(newCollection).not.toBe(collection);
  });

  it('should return collection without given query', () => {
    expect(Object.keys(collection).length).toBe(2);
    expect(collection[queries.key(first as QueryData)]).not.toBeUndefined();
    const newCollection = queries.deleteQuery(collection, first as QueryData);
    expect(Object.keys(newCollection).length).toBe(1);
    expect(newCollection[queries.key(first as QueryData)]).toBeUndefined();
  });
});

describe('setCompare', () => {
  const collection: Record<string, QueryData> = {};

  it('should not mutate original collection', () => {
    expect(Object.keys(collection).length).toBe(0);
    const newCollection = queries.setCompare({}, {}, first as QueryData, true);
    expect(Object.keys(collection).length).toBe(0);
    expect(newCollection).not.toBe(collection);
  });

  it('should add query to new collection if given true for isCompared', () => {
    expect(Object.keys(collection).length).toBe(0);
    const newCollection = queries.setCompare({}, {}, first as QueryData, true);
    expect(Object.keys(newCollection).length).toBe(1);
    expect(newCollection[queries.key(first as QueryData)]).toEqual(first);
  });

  it('should set execution time to 0 if given false for isCompared', () => {
    let qs:any = { [`${queries.key(first as QueryData)}`]: first };
    expect(Object.keys(collection).length).toBe(0);
    const newCollection = queries.setCompare({}, qs, first as QueryData, true);
    expect(Object.keys(newCollection).length).toBe(1);
    expect(newCollection[queries.key(first as QueryData)].executionPlan['Planning Time']).toBe(1);
    expect(newCollection[queries.key(first as QueryData)].executionPlan['Execution Time']).toBe(1);
    const newSetCollection = queries.setCompare(newCollection, qs, first as QueryData, false);
    expect(Object.keys(newSetCollection).length).toBe(1);
    expect(newSetCollection[queries.key(first as QueryData)].executionPlan['Planning Time']).toBe(0);
    expect(newSetCollection[queries.key(first as QueryData)].executionPlan['Execution Time']).toBe(0);
  });
});
