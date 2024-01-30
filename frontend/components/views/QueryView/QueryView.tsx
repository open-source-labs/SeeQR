import { ipcRenderer } from 'electron';
import React, { useState } from 'react';
import { Button } from '@mui/material/';
import Box from '@mui/material/Box';
import styled from 'styled-components';
import { QueryData, AppState, DatabaseInfo } from '../../../types';
import { DBType } from '../../../../backend/BE_types';
import { defaultMargin } from '../../../style-variables';
import { getPrettyTime, createNewQuery } from '../../../lib/queries';
import { sendFeedback } from '../../../lib/utils';
import QueryGroup from './QueryGroup';
import QueryLabel from './QueryLabel';
import QueryDb from './QueryDb';
import QueryTopSummary from './QueryTopSummary';
import QuerySqlInput from './QuerySqlInput';
import QuerySummary from './QuerySummary';
import QueryTabs from './QueryTabs';
import QueryRunNumber from './QueryRunNumber';
import QueryHistory from './QueryHistory';

import {
  useQueryContext,
  useQueryDispatch,
} from '../../../state_management/Contexts/QueryContext';

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
  selectedDb: AppState['selectedDb'];
  setSelectedDb: AppState['setSelectedDb'];
  show: boolean;
  curDBType: DBType | undefined;
  setDBType: (dbType: DBType | undefined) => void;
  DBInfo: DatabaseInfo[] | undefined;
}

function QueryView({
  selectedDb,
  setSelectedDb,
  show,
  curDBType,
  setDBType,
  DBInfo,
}: QueryViewProps) {
  // using query state context and dispatch functions
  const queryStateContext = useQueryContext();
  const queryDispatchContext = useQueryDispatch();

  // I think this returns undefined if DBInfo is falsy idk lol
  const dbNames = DBInfo?.map((dbi) => dbi.db_name);
  const dbTypes = DBInfo?.map((dbi) => dbi.db_type);

  const defaultQuery: QueryData = {
    label: '',
    db: selectedDb,
    sqlString: '',
    group: '',
    numberOfSample: 0,
    totalSampleTime: 0,
    minimumSampleTime: 0,
    maximumSampleTime: 0,
    averageSampleTime: 0,
  };


  const localQuery = { ...defaultQuery, ...queryStateContext?.workingQuery };

  const [runQueryNumber, setRunQueryNumber] = useState(1);

  const [queriesRan, setQueriesRan] = useState<string[]>([]);

  const onLabelChange = (newLabel: string) => {
    queryDispatchContext!({
      type: 'UPDATE_WORKING_QUERIES',
      payload: { ...localQuery, label: newLabel },
    });
  };

  const onGroupChange = (newGroup: string) => {
    queryDispatchContext!({
      type: 'UPDATE_WORKING_QUERIES',
      payload: { ...localQuery, group: newGroup },
    });
  };

  const onDbChange = (newDb: string, nextDBType: DBType) => {
    // when db is changed we must change selected db state on app, as well as
    // request updates for db and table information. Otherwise database view tab
    // will show wrong information
    
    setSelectedDb(newDb);
    setDBType(nextDBType);

    ipcRenderer
      .invoke('select-db', newDb, nextDBType)
      .then(() => {
        queryDispatchContext!({
          type: 'UPDATE_WORKING_QUERIES',
          payload: { ...localQuery, db: newDb },
        });
      })

      .catch(() =>
        sendFeedback({
          type: 'error',
          message: `Failed to connect to ${newDb}`,
        }),
      );
  };
  const onSqlChange = (newSql: string) => {
    console.log(newSql);
    queryDispatchContext!({
      type: 'UPDATE_WORKING_QUERIES',
      payload: { ...localQuery, sqlString: newSql },
    });
  };

  const onRun = () => {
    console.log(localQuery.sqlString);
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
          runQueryNumber,
        },
        curDBType,
      )
      .then(
        ({
          db,
          sqlString,
          returnedRows,
          explainResults,
          error,
          numberOfSample,
          totalSampleTime,
          minimumSampleTime,
          maximumSampleTime,
          averageSampleTime,
        }) => {
          if (returnedRows) {
            if (queriesRan.length === 5) {
              queriesRan.pop();
            }
            queriesRan.unshift(sqlString);
            // setReturnedRows(returnedRows.length)
            setQueriesRan(queriesRan);
          }
          if (error) {
            throw error;
          }
          let transformedData;

          if (curDBType === DBType.Postgres) {
            transformedData = {
              sqlString,
              returnedRows,
              executionPlan: {
                numberOfSample,
                totalSampleTime,
                minimumSampleTime,
                maximumSampleTime,
                averageSampleTime,
                ...explainResults[0]['QUERY PLAN'][0],
              },
              label: localQuery.label,
              db,
              group: localQuery.group,
            };
          }
          if (curDBType === DBType.MySQL) {
            transformedData = {
              sqlString,
              returnedRows,
              label: localQuery.label,
              db,
              group: localQuery.group,
              executionPlan: {
                numberOfSample,
                totalSampleTime,
                minimumSampleTime,
                maximumSampleTime,
                averageSampleTime,
                // ...explainResults[0]['QUERY PLAN'][0],
                ...explainResults,
              },
            };
          }
          if (curDBType === DBType.SQLite) {
            transformedData = {
              sqlString,
              returnedRows,
              label: localQuery.label,
              db,
              group: localQuery.group,
              executionPlan: {
                numberOfSample,
                totalSampleTime,
                minimumSampleTime,
                maximumSampleTime,
                averageSampleTime,
                ...explainResults,
              },
            };
          }

          const keys: string[] = Object.keys(queryStateContext!.queries);
          for (let i = 0; i < keys.length; i++) {
            console.log(keys[i]);
            if (
              keys[i].includes(
                `label:${localQuery?.label} group:${localQuery?.group}`,
              )
            ) {
              return sendFeedback({
                type: 'info',
                message: `${localQuery.label} already exists in ${localQuery.group}`,
              });
            }
          }
          const newQueries = createNewQuery(
            transformedData,
            queryStateContext?.queries,
          );
          queryDispatchContext!({
            type: 'UPDATE_QUERIES',
            payload: newQueries,
          });

          queryDispatchContext!({
            type: 'UPDATE_WORKING_QUERIES',
            payload: transformedData,
          });
        },
      )
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

  const onRunQueryNumChange = (runNumber: number) => {
    setRunQueryNumber(runNumber);
  };

  if (!show) return null;
  return (
    <QueryViewContainer>
      <TopRow >
        <QueryLabel label={localQuery.label} onChange={onLabelChange} />
        <QueryGroup group={localQuery.group} onChange={onGroupChange} />
        <QueryDb
          db={localQuery.db}
          onDbChange={onDbChange}
          dbNames={dbNames}
          dbTypes={dbTypes}
        />
        <QueryTopSummary
          rows={queryStateContext?.workingQuery?.returnedRows?.length}
          totalTime={getPrettyTime(queryStateContext?.workingQuery)}
        />
      </TopRow>
      <QuerySqlInput
        sql={localQuery?.sqlString ?? ''}
        onChange={onSqlChange}
      />
      <QueryHistory history={queriesRan} onChange={onSqlChange} />
      <QueryRunNumber
        runNumber={runQueryNumber}
        onChange={onRunQueryNumChange}
      />
      <CenterButton>
        <RunButton variant="contained" onClick={onRun}>
          Run Query
        </RunButton>
      </CenterButton>
      <QuerySummary
        executionPlan={queryStateContext?.workingQuery?.executionPlan}
      />
      <QueryTabs
        results={queryStateContext?.workingQuery?.returnedRows}
        executionPlan={queryStateContext?.workingQuery?.executionPlan}
      />
    </QueryViewContainer>
  );
}

export default QueryView;
