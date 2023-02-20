import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import fs from 'fs';
import path from 'path';
import electron from 'electron';
import styled from 'styled-components';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AppState, QueryData } from '../../types';
import { deleteQuery, setCompare, saveQuery, getAppDataPath, key as queryKey } from '../../lib/queries';
import QueryEntry from './QueryEntry';
import logo from '../../../assets/logo/seeqr_dock.png';
import { greyDarkest, greyDark, greenPrimary, SidebarList, StyledListItemText, textColor } from '../../style-variables';

const Dropdown = styled(Accordion)`
root: {
  width: "100%",
    "& .Mui-expanded": {
      transform: "rotate(0deg)",
      backgroundColor: "pink",
      textColor: "green"
    }
  },
  accordion: {
    minHeight: 150, //ugly but works
    height: "100%",
    backgroundColor: "pink",
    textColor: "green"
  },
  details: {
    alignItems: "center",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 4
  }
`;

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
  | 'setFilePath'
  | 'newFilePath'
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
  setFilePath,
  newFilePath,
  show,
}: QueryListProps) => {
  const deleteQueryHandler = (query: QueryData) => () => {
    setQueries(deleteQuery(queries, query));
    setComparedQueries(deleteQuery(comparedQueries, query));
  };
  
  const setComparisonHandler = (query: QueryData) => (
    evt: React.ChangeEvent<HTMLInputElement>
    ) => {
      setComparedQueries(setCompare(comparedQueries, queries, query, evt.target.checked));
      // setComparedQueries(setCompare(comparedQueries, query));
    };
  
  const saveQueryHandler = (query: QueryData, newFilePath: string) => () => { 
    saveQuery(query, newFilePath);
  }

  const loadQueryHandler = async function () { 

    const globalAny: any = global;
    // If the platform is not macOS
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
        const data = JSON.parse(fs.readFileSync(globalAny.filepath).toString());
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
        if (!file.canceled) {
          globalAny.filepath = file.filePaths[0].toString();
          const data = JSON.parse(fs.readFileSync(globalAny.filepath).toString());
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
  const accordians:object = {};

  // Algorithm to create the entrys to be bundled into accoridans
  const compQ: any = { ...comparedQueries }
  if(values.length > 0) {
    for (let i = 0; i < values.length; i++) {
      let compared = false;
      if (compQ[queryKey(values[i])]) {
        if (compQ[queryKey(values[i])].hasOwnProperty('executionPlan')) {
          if (compQ[queryKey(values[i])].executionPlan['Execution Time'] !== 0) {
            compared = true;
          }
        }
      };
      
      const entry: JSX.Element = (
        <QueryEntry
          // This key is used in the .map to create the group label for accordians
          key={`QueryList_${values[i].label}_${values[i].db}_group:::${values[i].group}`}
          query={values[i]}
          select={() => setWorkingQuery(values[i])}
          isSelected={
            !!workingQuery && queryKey(values[i]) === queryKey(workingQuery)
          }
          deleteThisQuery={deleteQueryHandler(values[i])}
          isCompared={compared}
          setComparison={setComparisonHandler(values[i])}
          saveThisQuery={saveQueryHandler(values[i], newFilePath)}
        />
      );
      
      if(!accordians[values[i].group]) {
        accordians[values[i].group] = [entry];
      } else {
        accordians[values[i].group].push([entry]);
      };
    };
  };

  // function to store user-selected file path in state
  const designateFile = function() {
    const dialog = electron.remote.dialog;
    const WIN = electron.remote.getCurrentWindow();
  
    const options = {
      title: "Choose File Path",
      defaultPath: `${getAppDataPath()}`,
      buttonLabel: "Select Path",filters: [
            { name: 'JSON', extensions: ['json'] }
          ]
    }

    dialog.showSaveDialog(WIN, options)
      .then((res:any) => {
          setFilePath(res.filePath)
      });
  }

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

        <Tooltip title="Designate Save Location">
          <IconButton onClick={designateFile}> 
            <FileCopyIcon fontSize='large' />
          </IconButton>
        </Tooltip>
      </span>



      <StyledSidebarList>
        {Object.values(accordians).map((arrGroup: any) => (
          <Tooltip title="drop down">
            <Accordion>
              <AccordionSummary 
                sx={{
                backgroundColor: `${greenPrimary}`, color: "black"
              }} 
                expandIcon={<ExpandMoreIcon />} 
                aria-controls="panel1a-content" 
                id="panel1a-header"
              >
                <Typography sx={{ color: 'black' }}>
                  <QueryText primary={arrGroup[0].key.slice(arrGroup[0].key.indexOf('group:::') + 8)} />
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: `${greyDark}`, color: `${textColor}` }}>
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
