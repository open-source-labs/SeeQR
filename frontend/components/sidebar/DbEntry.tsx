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
import { sendFeedback } from '../../lib/utils';

const { ipcRenderer } = window.require('electron');

interface DbEntryProps {
  db: string;
  isSelected: boolean;
  select: (db: string) => void;
  duplicate: () => void;
}
const DbEntry = ({ db, isSelected, select, duplicate }: DbEntryProps) => {
  const handleDelete = () => {
    ipcRenderer
      .invoke('drop-db', db, isSelected)
      .then(() => {
        if (isSelected) select('');
      })
      .catch(() =>
        sendFeedback({ type: 'error', message: `Failed to delete ${db}` })
      );
  };

  return (
    <SidebarListItem
      button
      $customSelected={isSelected}
      onClick={() => select(db)}
    >
      <ListItemText primary={db} />
      <ListItemSecondaryAction>
        <Tooltip title="Copy Database">
          <IconButton edge="end" onClick={duplicate}>
            <FileCopyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Drop Database">
          <IconButton edge="end" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </SidebarListItem>
  );
};

export default DbEntry;
