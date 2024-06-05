import path from 'path';
import {
  Add,
  ExpandMore,
  DriveFileMove,
  UploadFile,
} from '@mui/icons-material';
import {
  IconButton,
  Tooltip,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import {
  deleteQuery,
  getAppDataPath,
  key as queryKey,
  saveQuery,
  setCompare,
  createNewQuery,
} from '../../lib/queries';
import {
  greenPrimary,
  greyDark,
  greyDarkest,
  SidebarList,
  StyledListItemText,
  textColor,
} from '../../style-variables';
import { AppState, QueryData } from '../../../shared/types/types';
import QueryEntry from './QueryEntry';

import { RootState } from '../../state_management/store';
import {
  updateQueries,
  updateComparedQueries,
  updateWorkingQuery,
  updateFilePath,
  updateLocalQuery,
} from '../../state_management/Slices/QuerySlice';
import { asyncTrigger } from '../../state_management/Slices/MenuSlice';

const QueryText = styled(StyledListItemText)`
  & .MuiListItemText-secondary {
    color: ${textColor};
  }
`;

const StyledSidebarList = styled(SidebarList)`
  background-color: ${greyDarkest};
`;

type QueryListProps = {
  createQuery: () => void;
  show: boolean;
};

function QueryList({ createQuery, show }: QueryListProps) {
  const dispatch = useDispatch();
  const queryState = useSelector((state: RootState) => state.query);

  // Handler to delete a query
  const deleteQueryHandler = (query: QueryData) => () => {
    const tempQueries = deleteQuery(queryState.queries, query);
    const tempLocalQueries = deleteQuery(queryState.localQuery.queries, query);

    // Update the state with the new set of queries after deletion
    dispatch(updateQueries(tempQueries));
    dispatch(updateLocalQuery({ queries: tempLocalQueries }));

    const tempComparedQueries = deleteQuery(queryState.comparedQueries, query);
    dispatch(updateComparedQueries(tempComparedQueries));
  };

  // Handler to set a query for comparison
  const setComparisonHandler =
    (query: QueryData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const tempQueries = setCompare(
        queryState.comparedQueries,
        queryState.queries,
        query,
        e.target.checked,
      );
      dispatch(updateComparedQueries(tempQueries));
    };

  // Handler to save a query
  const saveQueryHandler = (query: QueryData, filePath: string) => () => {
    saveQuery(query, filePath);
  };
  // Handler to load a query from a file
  const loadQueryHandler = async () => {
    const options = {
      title: 'Upload Query',
      defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: 'Upload',
      filters: [
        {
          name: 'Text Files',
          extensions: ['json', 'docx', 'txt'],
        },
      ],
    };
    // const setFilepathCallback = (val) => setFilePath(val);
    // menuDispatch({
    //   type: 'ASYNC_TRIGGER',
    //   loading: 'LOADING',
    //   options: {
    //     event: 'showOpenDialog',
    //     payload: options,
    //     callback: setFilepathCallback,
    //   },
    // });

    try {
      // grab the file path of where the query is saved
      const newFilePath = await ipcRenderer.invoke('showOpenDialog', options);
      // grab the file data from the back end
      const data = await ipcRenderer.invoke('read-query', newFilePath);
      const newData = JSON.parse(data);
      const query: unknown = Object.values(newData);

      // create a new query
      if (query) {
        const newQueries = createNewQuery(query[0], queryState.queries);
        // dispatch(updateQueries(newQueries));
        const newLocalQueries = createNewQuery(
          query[0],
          queryState.localQuery.queries,
        );
        // dispatch(updateLocalQuery({ queries: newLocalQueries }));
        dispatch(updateWorkingQuery(query[0]));
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!show) return null;
  // if (!queryStateContext) return null;

  // Convert query objects to an array of query data
  const values: Array<QueryData> = Object.values(queryState.queries);
  const accordions: Record<string, JSX.Element[]> = {};

  // Algorithm to create the entrys to be bundled into accoridans
  values.forEach((value) => {
    let compared = false;
    const comparedQuery = queryState.comparedQueries[queryKey(value)];
    if (comparedQuery && comparedQuery.executionPlan) {
      if (comparedQuery.executionPlan['Execution Time'] !== 0) {
        compared = true;
      }
    }

    const isSelected = (query: QueryData, workingQuery: any): boolean => {
      return (
        workingQuery !== null &&
        workingQuery !== undefined &&
        queryKey(query) === queryKey(workingQuery)
      );
    };

    const entry: JSX.Element = (
      <QueryEntry
        key={`QueryList_${value.label}_${value.db}_group:::${value.group}`}
        query={value}
        select={() => dispatch(updateWorkingQuery(value))}
        isSelected={isSelected(value, queryState.workingQuery)}
        deleteThisQuery={deleteQueryHandler(value)}
        isCompared={compared}
        setComparison={setComparisonHandler(value)}
        saveThisQuery={saveQueryHandler(value, queryState.newFilePath)}
      />
    );
    if (!accordions[value.group]) {
      accordions[value.group] = [entry];
    } else {
      accordions[value.group].push(entry);
    }
  });

  // Handler to designate a file path
  const designateFile = () => {
    // REVIEW: not sure if supposed to move this to it's own ipcMain
    const options = {
      title: 'Choose File Path',
      defaultPath: `${getAppDataPath()}`,
      buttonLabel: 'Select Path',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    };
    const setFilePathCallback = (val: string) => dispatch(updateFilePath(val));
    dispatch(
      asyncTrigger({
        loading: 'LOADING',
        options: {
          event: 'showSaveDialog',
          payload: options,
          callback: setFilePathCallback,
        },
      }),
    );
  };

  return (
    <>
      <span>
        <Tooltip title="New Query">
          <IconButton onClick={createQuery} size="large">
            <Add fontSize="large" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Import Query">
          <IconButton onClick={() => loadQueryHandler()} size="large">
            <UploadFile fontSize="large" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Designate Save Location">
          <IconButton onClick={() => designateFile()} size="large">
            <DriveFileMove fontSize="large" />
          </IconButton>
        </Tooltip>
      </span>

      <StyledSidebarList>
        {Object.values(accordions).map((arrGroup: any) => (
          <Tooltip title="drop down">
            <Accordion>
              <AccordionSummary
                sx={{
                  backgroundColor: `${greenPrimary}`,
                  color: 'black',
                }}
                expandIcon={<ExpandMore />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography sx={{ color: 'black' }}>
                  <QueryText
                    primary={arrGroup[0].key.slice(
                      arrGroup[0].key.indexOf('group:::') + 8,
                    )}
                  />
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{ backgroundColor: `${greyDark}`, color: `${textColor}` }}
              >
                {arrGroup}
              </AccordionDetails>
            </Accordion>
          </Tooltip>
        ))}
      </StyledSidebarList>
    </>
  );
}

export default QueryList;
