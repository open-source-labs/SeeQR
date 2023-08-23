import path from 'path';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { IconButton, Tooltip } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import React, { useContext } from 'react';
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
import { AppState, QueryData } from '../../types';
import QueryEntry from './QueryEntry';

import {
  useQueryContext,
  useQueryDispatch,
} from '../../state_management/Contexts/QueryContext';
import MenuContext from '../../state_management/Contexts/MenuContext';

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
  const { dispatch: menuDispatch } = useContext(MenuContext);

  // using query state context and dispatch functions
  const queryStateContext = useQueryContext();
  const queryDispatchContext = useQueryDispatch();

  const deleteQueryHandler = (query: QueryData) => () => {
    if (!queryStateContext) return;
    const tempQueries = deleteQuery(queryStateContext.queries, query);

    queryDispatchContext!({
      type: 'UPDATE_QUERIES',
      payload: tempQueries,
    });

    const tempComparedQueries = deleteQuery(
      queryStateContext.comparedQueries,
      query,
    );

    queryDispatchContext!({
      type: 'UPDATE_COMPARED_QUERIES',
      payload: tempComparedQueries,
    });
  };

  const setComparisonHandler =
    (query: QueryData) => (evt: React.ChangeEvent<HTMLInputElement>) => {
      if (!queryStateContext) return;
      const tempQueries = setCompare(
        queryStateContext.comparedQueries,
        queryStateContext.queries,
        query,
        evt.target.checked,
      );

      queryDispatchContext!({
        type: 'UPDATE_COMPARED_QUERIES',
        payload: tempQueries,
      });
    };

  const saveQueryHandler = (query: QueryData, filePath: string) => () => {
    saveQuery(query, filePath);
  };

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
        if (!queryStateContext) return;
        const newQueries = createNewQuery(query[0], queryStateContext.queries);

        queryDispatchContext!({
          type: 'UPDATE_QUERIES',
          payload: newQueries,
        });

        queryDispatchContext!({
          type: 'UPDATE_WORKING_QUERIES',
          payload: query[0],
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!show) return null;
  if (!queryStateContext) return null;
  const values: Array<QueryData> = Object.values(queryStateContext.queries);
  const accordians: object = {};

  // Algorithm to create the entrys to be bundled into accoridans
  const compQ: any = { ...queryStateContext?.comparedQueries };
  if (values.length > 0) {
    for (let i = 0; i < values.length; i++) {
      let compared = false;
      if (compQ[queryKey(values[i])]) {
        if (compQ[queryKey(values[i])].hasOwnProperty('executionPlan')) {
          if (
            compQ[queryKey(values[i])].executionPlan['Execution Time'] !== 0
          ) {
            compared = true;
          }
        }
      }

      const entry: JSX.Element = (
        <QueryEntry
          // This key is used in the .map to create the group label for accordians
          key={`QueryList_${values[i].label}_${values[i].db}_group:::${values[i].group}`}
          query={values[i]}
          select={() =>
            queryDispatchContext!({
              type: 'UPDATE_WORKING_QUERIES',
              payload: values[i],
            })
          }
          isSelected={
            !!queryStateContext?.workingQuery &&
            queryKey(values[i]) === queryKey(queryStateContext?.workingQuery)
          }
          deleteThisQuery={deleteQueryHandler(values[i])}
          isCompared={compared}
          setComparison={setComparisonHandler(values[i])}
          saveThisQuery={saveQueryHandler(
            values[i],
            queryStateContext.newFilePath,
          )}
        />
      );

      if (!accordians[values[i].group]) {
        accordians[values[i].group] = [entry];
      } else {
        accordians[values[i].group].push([entry]);
      }
    }
  }

  // function to store user-selected file path in state

  const designateFile = () => {
    // REVIEW: not sure if supposed to move this to it's own ipcMain
    const options = {
      title: 'Choose File Path',
      defaultPath: `${getAppDataPath()}`,
      buttonLabel: 'Select Path',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    };
    const setFilePathCallback = (val) =>
      queryDispatchContext!({
        type: 'UPDATE_FILEPATH',
        payload: val,
      });
    menuDispatch({
      type: 'ASYNC_TRIGGER',
      loading: 'LOADING',
      options: {
        event: 'showSaveDialog',
        payload: options,
        callback: setFilePathCallback,
      },
    });
  };

  return (
    <>
      <span>
        <Tooltip title="New Query">
          <IconButton onClick={createQuery} size="large">
            <AddIcon fontSize="large" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Import Query">
          <IconButton onClick={() => loadQueryHandler()} size="large">
            <UploadFileIcon fontSize="large" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Designate Save Location">
          <IconButton onClick={() => designateFile()} size="large">
            <DriveFileMoveIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </span>

      <StyledSidebarList>
        {Object.values(accordians).map((arrGroup: any) => (
          <Tooltip title="drop down">
            <Accordion>
              <AccordionSummary
                sx={{
                  backgroundColor: `${greenPrimary}`,
                  color: 'black',
                }}
                expandIcon={<ExpandMoreIcon />}
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
