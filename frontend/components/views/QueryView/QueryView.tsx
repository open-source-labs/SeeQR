import { IpcMainEvent } from 'electron';
import React, { FunctionComponent } from 'react';
import { Query, isBackendQueryData, CreateNewQuery } from '../../../types';

import QueryLabel from './QueryLabel';
import QueryDb from './QueryDb';
import QueryTopSummary from './QueryTopSummary';
import QuerySqlInput from './QuerySqlInput';
import QuerySummary from './QuerySummary';
import QueryTabs from './QueryTabs';

const { ipcRenderer } = window.require('electron');

interface QueryViewProps {
  query?: Query;
  createNewQuery: CreateNewQuery;
  selectedDb: string;
}

const QueryView = ({ query, createNewQuery, selectedDb }: QueryViewProps) => {

  // if (!query) return <h4>Creating new</h4>;
  // Listen to Backend for data returned from running query and create/update query
  ipcRenderer.on(
    // TODO: handle updates
    'return-execute-query',
    (evt: IpcMainEvent, queryData: unknown) => {
      if (isBackendQueryData(queryData)) {
        const transformedData = {
          sqlString: queryData.queryString,
          returnedRows: queryData.queryData,
          executionPlan: queryData.queryStatistics,
          db: queryData.queryLabel,
          label: queryData.queryCurrentSchema,
        };
        createNewQuery(transformedData);
      }
    }
  );

  const onSqlChange = (newSql: string) => console.log(newSql)

  return (
    <>
      <h4>Query View</h4>
      <QueryLabel label={query?.label || 'New Query'} />
      <QueryDb db={query?.db || selectedDb} />
      <QueryTopSummary rows={query?.rows || 0} totalTime={query?.totalTime || 'n/a'} />
      <QuerySqlInput sql={query?.sqlString ?? ''} onChange={onSqlChange} />
      <QuerySummary executionPlan={query?.executionPlan} />
      <QueryTabs
        results={query?.returnedRows}
        executionPlan={query?.executionPlan}
      />
    </>
  );
};

export default QueryView;
