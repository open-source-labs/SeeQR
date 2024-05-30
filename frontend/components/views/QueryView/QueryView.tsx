import { ipcRenderer } from 'electron';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Box } from '@mui/material/';
import styled from 'styled-components';
import {
  DBType,
  QueryData,
  AppState,
  DatabaseInfo,
} from '../../../../shared/types/types';
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

import { RootState, AppDispatch } from '../../../state_management/store';
import { updateQueries, updateWorkingQuery, updateLocalQuery } from '../../../state_management/Slices/QuerySlice'; 

// Styled components for layout and styling
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

// Interface for component props
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
  // Get working query from Redux store using useSelector
  const localQuery = useSelector((state: any) => state.query.workingQuery);
  // const localQuery: QueryData = useSelector((state: any) => state.query.workingQuery);


  // Get dispatch function from react-redux
  const dispatch = useDispatch<AppDispatch>(); 

  // Extract database names and types from DBInfo
  const dbNames = DBInfo?.map((dbi) => dbi.db_name);
  const dbTypes = DBInfo?.map((dbi) => dbi.db_type);
    
  const [runQueryNumber, setRunQueryNumber] = useState(1); // Local state for run query number
  const [queriesRan, setQueriesRan] = useState<string[]>([]); // Local state for queries history

  // Handles changing the query label
  const onLabelChange = (newLabel: string) => {
    dispatch(updateWorkingQuery({ ...localQuery, label: newLabel }));
  };

  // Handles changing the query group
  const onGroupChange = (newGroup: string) => {
    dispatch(updateWorkingQuery({ ...localQuery, group: newGroup }));
  };

  // Handles changing the selected database
  const onDbChange = (newDb: string, nextDBType: DBType) => {
    // when db is changed we must change selected db state on app, as well as
    // request updates for db and table information. Otherwise database view tab
    // will show wrong information
    setSelectedDb(newDb);
    setDBType(nextDBType);

    ipcRenderer
      // Invoke main process to select database
      .invoke('select-db', newDb, nextDBType)
      .then(() => {
        dispatch(updateWorkingQuery({ ...localQuery, db: newDb }));
      })
      .catch(() =>
        sendFeedback({
          type: 'error',
          message: `Failed to connect to ${newDb}`,
        })
      );
  };
   // Handles changing the SQL string
   const onSqlChange = (newSql: string) => {
    // console.log(newSql);
    dispatch(updateWorkingQuery({ ...localQuery, sqlString: newSql }));
  };

  const onRun = () => {
    // Run the query logic
    if (!localQuery.label.trim()) {
      sendFeedback({
        type: 'info',
        message: "Queries without a label will run but won't be saved",
      }).catch(error => console.error(error)); ;
    }

    if (!localQuery.group.trim()) {
      sendFeedback({
        type: 'info',
        message: "Queries without a group will run but won't be saved",
      }).catch(error => console.error(error)); ;
    }

    // Request backend to run query
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
          // Handle the results from running the query
          if (returnedRows) {
            if (queriesRan.length === 5) {
              queriesRan.pop();
            }
            queriesRan.unshift(sqlString);
            setQueriesRan(queriesRan);
          }
          if (error) {
            throw error;
          }
          let transformedData;

          // Transform data based on the database type
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
          // Check if the query already exists
          const keys: string[] = Object.keys(localQuery.queries);
          for (let i = 0; i < keys.length; i++) {
            if (
              keys[i].includes(
                `label:${localQuery.label} group:${localQuery.group}`,
              )
            ) {
              return sendFeedback({
                type: 'info',
                message: `${localQuery.label} already exists in ${localQuery.group}`,
              });
            }
          }
          // Create a new query object based on the transformed data and add it to the queries list
          // const newQueries = createNewQuery(
          //   transformedData,
          //   localQuery.queries,
          // );
          const newQueries = { 
            ...localQuery.queries, 
            [`label:${localQuery.label} group:${localQuery.group}`]: transformedData 
          }; 
          // Dispatch an action to update the queries list with the new query
          dispatch(updateQueries(newQueries))
          // Dispatch an action to update the working query with the transformed data
          dispatch(updateWorkingQuery(transformedData));
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
  // Handler for changing the run query number
  const onRunQueryNumChange = (runNumber: number) => {
    setRunQueryNumber(runNumber);
  };

  if (!show) return null;
  return (
    <QueryViewContainer>
      <TopRow>
        <QueryLabel label={localQuery.label} onChange={onLabelChange} />
        <QueryGroup group={localQuery.group} onChange={onGroupChange} />
        <QueryDb
          db={localQuery.db}
          onDbChange={onDbChange}
          dbNames={dbNames}
          dbTypes={dbTypes}
        />
        <QueryTopSummary
          rows={localQuery.returnedRows?.length}
          totalTime={getPrettyTime(localQuery)}
        />
      </TopRow>
      <QuerySqlInput sql={localQuery.sqlString} onChange={onSqlChange} />
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
        executionPlan={localQuery.executionPlan}
      />
      <QueryTabs
        results={localQuery.returnedRows}
        executionPlan={localQuery.executionPlan}
      />
    </QueryViewContainer>
  );
}

export default QueryView;