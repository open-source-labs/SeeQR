import React, { useState } from 'react';
import {
  IconButton,
  ListItemSecondaryAction,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
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
  select: (db: string, dbt: DBType) => void;
  duplicate: () => void;
  dbType: DBType;
}

const DbEntry = ({
  db,
  isSelected,
  select,
  duplicate,
  dbType,
}: DbEntryProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    ipcRenderer
      .invoke('drop-db', db, isSelected, dbType)
      .then(() => {
        if (isSelected) select('', dbType);
        setIsDeleteDialogOpen(false);
      })
      .catch(() =>
        sendFeedback({ type: 'error', message: `Failed to delete ${db}` })
      );
  };

  return (
    <SidebarListItem
      button
      $customSelected={isSelected}
      onClick={() => select(db, dbType)}
    >
      <StyledListItemText primary={`${db} [${dbType}]`} />
      <ListItemSecondaryAction>
        <Tooltip title="Copy Database">
          <IconButton edge="end" onClick={duplicate}>
            <FileCopyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Drop Database">
          <IconButton edge="end" onClick={() => setIsDeleteDialogOpen(true)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle style={{color:'black'}} id="alert-dialog-title">Confirm deletion</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete the database {db}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDelete} color="primary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </ListItemSecondaryAction>
    </SidebarListItem>
  );
};

export default DbEntry;
