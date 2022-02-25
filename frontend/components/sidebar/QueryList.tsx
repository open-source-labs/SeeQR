import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
// import UploadFileIcon from '@material-ui/icons/FileCopy';
import styled from 'styled-components';
import { SidebarList } from '../../style-variables';
import { AppState, QueryData } from '../../types';
import { deleteQuery, setCompare, saveQuery, key as queryKey } from '../../lib/queries';
import QueryEntry from './QueryEntry';
import logo from '../../../assets/logo/seeqr_dock.png';
import { greyDarkest } from '../../style-variables';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import path from 'path';
import fs from 'fs';
import electron from 'electron';

import {
  SidebarListItem,
  StyledListItemText,
  textColor,
} from '../../style-variables';

const QueryText = styled(StyledListItemText)`
  & .MuiListItemText-secondary {
    color: ${textColor};
  }
`;

type QueryListProps = Pick<
  AppState,
  | 'queries'
  | 'setQueries'
  | 'comparedQueries'
  | 'setComparedQueries'
  | 'workingQuery'
  | 'setWorkingQuery'
> & {
  createQuery: () => void;
  show: boolean;
};

const StyledSidebarList = styled(SidebarList)`
background-color: ${greyDarkest};
`;

const QueryList = ({
  queries,
  createQuery,
  setQueries,
  comparedQueries,
  setComparedQueries,
  workingQuery,
  setWorkingQuery,
  show,
}: QueryListProps) => {
  const deleteQueryHandler = (query: QueryData) => () => {
    console.log(query);
    setQueries(deleteQuery(queries, query));
    setComparedQueries(deleteQuery(comparedQueries, query));
  };
  
  const setComparisonHandler = (query: QueryData) => (
    evt: React.ChangeEvent<HTMLInputElement>
    ) => {
      setComparedQueries(setCompare(comparedQueries, query, evt.target.checked));
    };
  
  const saveQueryHandler = (query: QueryData) => () => { 
    saveQuery(query)
  }

  const loadQueryHandler = async function () { 

    const globalAny: any = global;
    if (process.platform !== 'darwin') {
    // Resolves to a Promise<Object>
    electron.remote.dialog.showOpenDialog({
      title: 'Select the File to be uploaded',
      defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: 'Upload',
      // Restricting the user to only Text Files.
      filters: [
        {
          name: 'Text Files',
          extensions: ['json', 'docx', 'txt']
        },],
      // Specifying the File Selector Property
      properties: ['openFile']
    }).then((file: any) => {
      // Stating whether dialog operation was
      // cancelled or not.
      if (!file.canceled) {
        // Updating the GLOBAL filepath variable 
        // to user-selected file.
        globalAny.filepath = file.filePaths[0].toString();
        // console.log(globalAny.filepath);
        const data = JSON.parse(fs.readFileSync(globalAny.filepath).toString());
        console.log(data);
        setQueries(data);
      }
      return undefined;
    }).catch((err: object | undefined) => {
      console.log(err);
      return undefined;
    });
  }
  else {
    // If the platform is 'darwin' (macOS)
    electron.remote.dialog.showOpenDialog({
      title: 'Select the File to be uploaded',
      defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: 'Upload',
      filters: [
        {
          name: 'Text Files',
          extensions: ['json', 'docx', 'txt']
        },],
      // Specifying the File Selector and Directory 
      // Selector Property In macOS
      properties: ['openFile', 'openDirectory']
    }).then((file: any) => {
      // console.log('line 96', file.canceled);
      if (!file.canceled) {
        globalAny.filepath = file.filePaths[0].toString();
        // console.log(globalAny.filepath);
        const data = JSON.parse(fs.readFileSync(globalAny.filepath).toString());
        console.log(data);
        setQueries(data);
      }
      return undefined;
    }).catch((err: object) => {
      console.log(err);
      return undefined;
    });
  }

  }

  if (!show) return null;

  const values: Array<QueryData> = Object.values(queries);
  const accordians = {};
  const groups = new Set();
  let splitGroups:any;
  let counter = 0;

  if(values.length > 0) {
    for (let i = 0; i < values.length; i++) {
      groups.add(values[i].group);
      const entry = <QueryEntry 
      key={`QueryList_${values[i].label}_${values[i].db}_${values[i].group}`}
      query={values[i]}
      select={() => setWorkingQuery(values[i])}
      isSelected={
        !!workingQuery && queryKey(values[i]) === queryKey(workingQuery)
      }
      deleteThisQuery={deleteQueryHandler(values[i])}
      isCompared={!!comparedQueries[queryKey(values[i])]}
      setComparison={setComparisonHandler(values[i])}
      saveThisQuery={saveQueryHandler(values[i])} 
      />
      
      if(!accordians[values[i].group]) {
        accordians[values[i].group] = [entry];
      } else {
        accordians[values[i].group].push([entry]);
      };
    };
    splitGroups = [...groups];
  };

  return (
    <>
      <span>
        <Tooltip title="New Query">
          <IconButton onClick={createQuery}>
            <AddIcon fontSize="large" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Import Query">
          <IconButton onClick={loadQueryHandler}>
            <UploadFileIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </span>

      <StyledSidebarList>
        {Object.values(accordians).map((arrGroup: any) => (
            <Tooltip title="drop down">
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                  <Typography>
                    <QueryText primary={splitGroups[counter++]} />
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {arrGroup}
                </AccordionDetails>
              </Accordion>
            </Tooltip>
        ))}
      </StyledSidebarList>
    </>
  );
};

export default QueryList;
