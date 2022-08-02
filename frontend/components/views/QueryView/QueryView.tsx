import { IpcRendererEvent, ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { Button, Box } from '@material-ui/core/';
import styled from 'styled-components';
import {
  QueryData,
  CreateNewQuery,
  AppState,
  isDbLists,
  DBType,
  DatabaseInfo,
} from '../../../types';
import { defaultMargin } from '../../../style-variables';
import { getPrettyTime } from '../../../lib/queries';
import { once, sendFeedback } from '../../../lib/utils';
import QueryGroup from './QueryGroup';
import QueryLabel from './QueryLabel';
import QueryDb from './QueryDb';
import QueryTopSummary from './QueryTopSummary';
import QuerySqlInput from './QuerySqlInput';
import QuerySummary from './QuerySummary';
import QueryTabs from './QueryTabs';

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
  queries: Record<string, QueryData>;
  curDBType: DBType | undefined;
  setDBType: (dbType: DBType | undefined) => void;
  DBInfo: DatabaseInfo[] | undefined;
  setDBInfo: (dbInfo: DatabaseInfo[] | undefined) => void;
}

const QueryView = ({
  query,
  createNewQuery,
  selectedDb,
  setSelectedDb,
  setQuery,
  show,
  queries,
  curDBType,
  setDBType,
  DBInfo,
  setDBInfo,
}: QueryViewProps) => {
  // const [databases, setDatabases] = useState<string[]>([]);

  // I think this returns undefined if DBInfo is falsy idk lol
  const dbNames = DBInfo?.map((dbi) => dbi.db_name);
  const dbTypes = DBInfo?.map((dbi) => dbi.db_type);
  

  const defaultQuery: QueryData = {
    label: '',
    db: selectedDb,
    sqlString: '',
    group: '',
  };

  const localQuery = { ...defaultQuery, ...query };
  // console.log('local query', localQuery);
  // console.log('query', query);
  // console.log('defaultQuery', defaultQuery);
  // console.log('curDBType', curDBType);

  const onLabelChange = (newLabel: string) => {
    setQuery({ ...localQuery, label: newLabel });
  };

  const onGroupChange = (newGroup: string) => {
    setQuery({ ...localQuery, group: newGroup });
  };

  const onDbChange = (newDb: string, nextDBType: DBType) => {
    // when db is changed we must change selected db state on app, as well as
    // request updates for db and table information. Otherwise database view tab
    // will show wrong information

    console.log('when selecting a database from the dropdown menu, we first go here in queryview')
    console.log('nextDBType in QueryView', nextDBType)
    console.log('newDB in Query View', newDb)

    setSelectedDb(newDb);
    setDBType(nextDBType);

    ipcRenderer
      .invoke('select-db', newDb, nextDBType)
      .then(() => {
        setQuery({ ...localQuery, db: newDb });
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

    if (!localQuery.group.trim()) {
      sendFeedback({
        type: 'info',
        message: "Queries without a group will run but won't be saved",
      });
    }

    // request backend to run query
    ipcRenderer
      .invoke(
        'run-query',
        {
          targetDb: localQuery.db,
          sqlString: localQuery.sqlString,
          selectedDb,
        },
        curDBType
      )
      .then(({ db, sqlString, returnedRows, explainResults, error }) => {
        if (error) {
          throw error;
        }

        const transformedData = {
          sqlString,
          returnedRows,
          executionPlan: explainResults[0]['QUERY PLAN'][0],
          label: localQuery.label,
          db,
          group: localQuery.group,
        };

        const keys: string[] = Object.keys(queries);
        for (let i = 0; i < keys.length; i++) {
          if (
            keys[i].includes(`db:${localQuery.db} group:${localQuery.group}`)
          ) {
            return sendFeedback({
              type: 'info',
              message: `${localQuery.db} already exists in ${localQuery.group}`,
            });
          }
        }
        createNewQuery(transformedData);
      })
      .then(() => {
        localQuery.sqlString = '';
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
        <QueryGroup group={localQuery.group} onChange={onGroupChange} />
        <QueryDb db={localQuery.db} onDbChange={onDbChange} dbNames={dbNames} dbTypes={dbTypes} />
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
