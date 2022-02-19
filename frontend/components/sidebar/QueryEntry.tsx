import React from 'react';
// import electron from 'electron';

import styled from 'styled-components';
import {
  IconButton,
  ListItemSecondaryAction,
  Checkbox,
  Tooltip,
  Button
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SaveIcon from '@material-ui/icons/Save';
import {
  SidebarListItem,
  StyledListItemText,
  textColor,
} from '../../style-variables';
import { QueryData, AppState } from '../../types';



const path = require('path');
const fs = require('fs');
const electron = require('electron');


const QueryText = styled(StyledListItemText)`
  & .MuiListItemText-secondary {
    color: ${textColor};
  }
`;

const CompareCheck = styled(Checkbox)`
  color: ${textColor};
`;

interface QueryEntryProps {
  query: QueryData;
  isSelected: boolean;
  select: () => void;
  setComparison: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  isCompared: boolean;
  deleteThisQuery: () => void;
}

// const query = 


const handleClick = () => {
  electron.remote.dialog.showSaveDialog({
    title: 'Select the File Path to save',
    defaultPath: path.join(__dirname, '../assets/logo/logo_color.png'),
    // defaultPath: path.join(__dirname, '../assets/'),
    buttonLabel: 'Save',
    // Restricting the user to only Text Files.
    // filters: [
    //     {
      //         name: 'Text Files',
      //         extensions: ['txt', 'docx']
    //     }, ],
    properties: []
}).then(file => {
    // Stating whether dialog operation was cancelled or not.
    console.log(file.cancelled);
    if (!file.cancelled) {
      console.log(file.filePath.toString());
      
        // Creating and Writing to the sample.txt file
        fs.writeFile(file.filePath.toString(), 
                     'This is a Sample File', function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    }
}).catch(err => {
    console.log(err)
  });
}



const QueryEntry = ({
  query,
  select,
  isSelected,
  setComparison,
  isCompared,
  deleteThisQuery,
}: QueryEntryProps) => (
  <SidebarListItem button $customSelected={isSelected} onClick={select}>
    <QueryText primary={query.label} secondary={query.db} />
    <ListItemSecondaryAction>
      <Tooltip title="View in Comparison">
        <CompareCheck onChange={setComparison} checked={isCompared} />
      </Tooltip>
      <Tooltip title="Forget Query">
        <IconButton edge="end" onClick={deleteThisQuery}>
          <CloseIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Save Query">
        <Button startIcon={<SaveIcon />} onClick={handleClick} />
      </Tooltip>
      
    </ListItemSecondaryAction>
  </SidebarListItem>
  
);



export default QueryEntry;
