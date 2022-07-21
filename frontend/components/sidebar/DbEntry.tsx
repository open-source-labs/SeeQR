import React from 'react';
import {
  IconButton,
  ListItemSecondaryAction,
  Tooltip,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { SidebarListItem, StyledListItemText } from '../../style-variables';
import { sendFeedback } from '../../lib/utils';
import { DBType } from '../../types';

const { ipcRenderer } = window.require('electron');

interface DbEntryProps {
  db: string;
  isSelected: boolean;
  select: (db: string) => void;
  duplicate: () => void;
  dbType: DBType;
}
const DbEntry = ({ db, isSelected, select, duplicate, dbType }: DbEntryProps) => {
  const handleDelete = () => {
    ipcRenderer
      .invoke('drop-db', db, isSelected, dbType)
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
      <StyledListItemText primary={db} />
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
