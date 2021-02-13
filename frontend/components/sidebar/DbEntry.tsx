import React from 'react';
import {
  IconButton,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { SidebarListItem } from '../../style-variables';

const { ipcRenderer } = window.require('electron');

interface DbEntryProps {
  db: string;
  isSelected: boolean;
  select: (db: string) => void;
  duplicate: () => void;
}
const DbEntry = ({ db, isSelected, select, duplicate }: DbEntryProps) => {
  const handleDelete = () => {
    ipcRenderer.send('drop-db', db, isSelected)
    if (isSelected) select('');
  }
  
  return (
    <SidebarListItem button $customSelected={isSelected} onClick={() => select(db)}>
      <ListItemText primary={db} />
      <ListItemSecondaryAction>
        <Tooltip title="Copy Database">
          <IconButton edge="end">
            <FileCopyIcon onClick={duplicate} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Drop Database">
          <IconButton edge="end">
            <DeleteIcon onClick={handleDelete} />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </SidebarListItem>
  );
};

export default DbEntry;
