import { IpcMainEvent } from 'electron';
import React, { useEffect } from 'react';
import { MuiThemeProvider, Button } from '@material-ui/core/';
import { MuiTheme } from '../../../style-variables';
import {
  QueryData,
  isBackendQueryData,
  CreateNewQuery,
  AppState,
} from '../../../types';
import { getPrettyTime } from '../../../lib/queries';

import QueryLabel from './QueryLabel';
import QueryDb from './QueryDb';
import QueryTopSummary from './QueryTopSummary';
import QuerySqlInput from './QuerySqlInput';
import QuerySummary from './QuerySummary';
import QueryTabs from './QueryTabs';

const { ipcRenderer } = window.require('electron');

interface QueryViewProps {
  query?: AppState['workingQuery'];
  createNewQuery: CreateNewQuery;
  selectedDb: string;
  setQuery: AppState['setWorkingQuery'];
}

const QueryView = ({
  query,
  createNewQuery,
  selectedDb,
  setQuery,
}: QueryViewProps) => {
  const defaultQuery: QueryData = {
    label: '',
    db: selectedDb,
    sqlString: '',
  };

  const localQuery = { ...defaultQuery, ...query };

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
        // TODO: handle updates
        createNewQuery(transformedData);
      }
    };
    ipcRenderer.on('return-execute-query', receiveQuery);
    return () =>
      ipcRenderer.removeListener('return-execute-query', receiveQuery);
  });

  const onLabelChange = (newLabel: string) => {
    setQuery({ ...localQuery, label: newLabel });
  };
  const onDbChange = (newDb: string) => {
    setQuery({ ...localQuery, db: newDb });
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

    // update db and table lists in case they are affected
    ipcRenderer.send('return-db-list');
  };

  return (
    <>
      <MuiThemeProvider theme={MuiTheme}>
        <h4>Query View</h4>
        <QueryLabel label={localQuery.label} onChange={onLabelChange} />
        <QueryDb db={localQuery.db} onChange={onDbChange} />
        <Button variant="contained" onClick={onRun}>
          Run Query
        </Button>
        <QueryTopSummary
          rows={query?.returnedRows?.length || 0}
          totalTime={getPrettyTime(query)}
        />
        <QuerySqlInput
          sql={localQuery?.sqlString ?? ''}
          onChange={onSqlChange}
        />
        <QuerySummary executionPlan={query?.executionPlan} />
        <QueryTabs
          results={query?.returnedRows}
          executionPlan={query?.executionPlan}
        />
      </MuiThemeProvider>
    </>
  );
};

export default QueryView;
