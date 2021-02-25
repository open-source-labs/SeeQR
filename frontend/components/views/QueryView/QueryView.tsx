import { IpcRendererEvent, ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { Button, Box } from '@material-ui/core/';
import styled from 'styled-components';
import {
  QueryData,
  CreateNewQuery,
  AppState,
  isDbLists,
} from '../../../types';
import { defaultMargin } from '../../../style-variables';
import { getPrettyTime } from '../../../lib/queries';
import { once, sendFeedback } from '../../../lib/utils';

import QueryLabel from './QueryLabel';
import QueryDb from './QueryDb';
import QueryTopSummary from './QueryTopSummary';
import QuerySqlInput from './QuerySqlInput';
import QuerySummary from './QuerySummary';
import QueryTabs from './QueryTabs';

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

const QueryViewContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
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
    const receiveDbs = (evt: IpcRendererEvent, dbLists: unknown) => {
      if (isDbLists(dbLists)) {
        setDatabases(dbLists.databaseList.map((db) => db.db_name));
      }
    };
    ipcRenderer.on('db-lists', receiveDbs);
    requestDbListOnce();

    return () => {
      ipcRenderer.removeListener('db-lists', receiveDbs);
    }
  });

  const onLabelChange = (newLabel: string) => {
    setQuery({ ...localQuery, label: newLabel });
  };

  const onDbChange = (newDb: string) => {
    // when db is changed we must change selected db state on app, as well as
    // request updates for db and table information. Otherwise database view tab
    // will show wrong informatio
    ipcRenderer
      .invoke('select-db', newDb)
      .then(() => {
        setQuery({ ...localQuery, db: newDb });
        setSelectedDb(newDb);
      })

      .catch(() =>
        sendFeedback({
          type: 'error',
          message: `Failed to connect to ${newDb}`,
        })
      );
  };
  const onSqlChange = (newSql: string) => {
    // because App's workingQuery changes ref
    setQuery({ ...localQuery, sqlString: newSql });
  };

  const onRun = () => {
    if (!localQuery.label.trim()) {
      sendFeedback({
        type: 'info',
        message: "Queries without a label will run but won't be saved",
      });
    }

    // request backend to run query
    ipcRenderer
      .invoke('run-query', {
        targetDb: localQuery.db,
        sqlString: localQuery.sqlString,
        selectedDb,
      })
      .then(({ db, sqlString, returnedRows, explainResults, error }) => {
        if (error) {
          throw error
        }

        const transformedData = {
          sqlString,
          returnedRows,
          executionPlan: explainResults[0]['QUERY PLAN'][0],
          label: localQuery.label,
          db,
        };
        createNewQuery(transformedData);
      })
      .catch((err) => {
        sendFeedback({
          type: 'error',
          message: err ?? 'Failed to Run Query',
        });
      });
  };

  if (!show) return null;
  return (
    <QueryViewContainer>
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
      <QuerySqlInput
        sql={localQuery?.sqlString ?? ''}
        onChange={onSqlChange}
        runQuery={onRun}
      />
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
    </QueryViewContainer>
  );
};

export default QueryView;
