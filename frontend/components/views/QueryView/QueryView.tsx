import { IpcMainEvent } from 'electron';
import React, { useEffect, useState } from 'react';
import { Button, Box } from '@material-ui/core/';
import styled from 'styled-components';
import {
  QueryData,
  isBackendQueryData,
  CreateNewQuery,
  AppState,
  isDbLists,
} from '../../../types';
import { defaultMargin } from '../../../style-variables';
import { getPrettyTime } from '../../../lib/queries';
import { once } from '../../../lib/utils';

import QueryLabel from './QueryLabel';
import QueryDb from './QueryDb';
import QueryTopSummary from './QueryTopSummary';
import QuerySqlInput from './QuerySqlInput';
import QuerySummary from './QuerySummary';
import QueryTabs from './QueryTabs';

const { ipcRenderer } = window.require('electron');

// emitting with no payload requests backend to send back a db-lists event with list of dbs
const requestDbListOnce = once(() => ipcRenderer.send('return-db-list'));

const TopRow = styled(Box)`
  display: flex;
  align-items: flex-end;
  margin: ${defaultMargin} 0;
`;

const CenterButton = styled(Box)`
  display: flex;
  justify-content: center;
`;

const RunButton = styled(Button)`
  margin: ${defaultMargin} auto;
`;

interface QueryViewProps {
  query?: AppState['workingQuery'];
  createNewQuery: CreateNewQuery;
  selectedDb: AppState['selectedDb'];
  setSelectedDb: AppState['setSelectedDb'];
  setQuery: AppState['setWorkingQuery'];
  show: boolean;
}

const QueryView = ({
  query,
  createNewQuery,
  selectedDb,
  setSelectedDb,
  setQuery,
  show,
}: QueryViewProps) => {
  const [databases, setDatabases] = useState<string[]>([]);

  const defaultQuery: QueryData = {
    label: '',
    db: selectedDb,
    sqlString: '',
  };

  const localQuery = { ...defaultQuery, ...query };

  // Register event listener that receives database list for db selector
  useEffect(() => {
    const receiveDbs = (evt: IpcMainEvent, dbLists: unknown) => {
      if (isDbLists(dbLists)) {
        setDatabases(dbLists.databaseList.map(db => db.db_name));
      }
    };
    ipcRenderer.on('db-lists', receiveDbs);
    requestDbListOnce();

    return () => ipcRenderer.removeListener('db-lists', receiveDbs);
  });

  // Register event listener that receives query information
  useEffect(() => {
    // Listen to Backend for data returned from running query and create/update query
    const receiveQuery = (evt: IpcMainEvent, queryData: unknown) => {
      if (isBackendQueryData(queryData)) {
        const transformedData = {
          sqlString: queryData.queryString,
          returnedRows: queryData.queryData,
          executionPlan: queryData.queryStatistics[0]['QUERY PLAN'][0],
          label: queryData.queryLabel,
          db: queryData.queryCurrentSchema,
        };
        createNewQuery(transformedData);
      }
    };

    ipcRenderer.on('return-execute-query', receiveQuery);

    return () =>
      ipcRenderer.removeListener('return-execute-query', receiveQuery);
  });

  const onLabelChange = (newLabel: string) => {
    setQuery({ ...localQuery, label: newLabel.trim() });
  };
  const onDbChange = (newDb: string) => {
    // when db is changed we must change selected db state on app, as well as
    // request updates for db and table information. Otherwise database view tab
    // will show wrong informatio
    setQuery({ ...localQuery, db: newDb });
    setSelectedDb(newDb);
    ipcRenderer.send('change-db', newDb);
    ipcRenderer.send('return-db-list', newDb);
  };
  const onSqlChange = (newSql: string) => {
    setQuery({ ...localQuery, sqlString: newSql });
  };

  const onRun = () => {
    // request backend to run query
    ipcRenderer.send('execute-query-tracked', {
      queryLabel: localQuery.label,
      queryString: localQuery.sqlString,
      queryCurrentSchema: localQuery.db,
    });
  };

  if (!show) return null;
  return (
    <>
      <TopRow>
        <QueryLabel label={localQuery.label} onChange={onLabelChange} />
        <QueryDb
          db={localQuery.db}
          onChange={onDbChange}
          databases={databases}
        />
        <QueryTopSummary
          rows={query?.returnedRows?.length}
          totalTime={getPrettyTime(query)}
        />
      </TopRow>
      <QuerySqlInput sql={localQuery?.sqlString ?? ''} onChange={onSqlChange} runQuery={onRun} />
      <CenterButton>
        <RunButton variant="contained" onClick={onRun}>
          Run Query
        </RunButton>
      </CenterButton>
      <QuerySummary executionPlan={query?.executionPlan} />
      <QueryTabs
        results={query?.returnedRows}
        executionPlan={query?.executionPlan}
      />
    </>
  );
};

export default QueryView;
