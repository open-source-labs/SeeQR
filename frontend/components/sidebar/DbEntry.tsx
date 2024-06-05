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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { SidebarListItem, StyledListItemText } from '../../style-variables';
import { sendFeedback } from '../../lib/utils';
import { DBType } from '../../../shared/types/types';
import { getAppDataPath } from '../../lib/queries';

const { ipcRenderer } = window.require('electron');

interface DbEntryProps {
  db: string;
  isSelected: boolean;
  select: (db: string, dbt: DBType) => void;
  duplicate: () => void;
  dbType: DBType;
}

function DbEntry({ db, isSelected, select, duplicate, dbType }: DbEntryProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    ipcRenderer
      .invoke('drop-db', db, isSelected, dbType)
      .then(() => {
        if (isSelected) select('', dbType);
        setIsDeleteDialogOpen(false);
      })
      .catch(() =>
        sendFeedback({ type: 'error', message: `Failed to delete ${db}` }),
      );
  };

  const handleExportDB = async () => {
    const options = {
      title: 'Choose File Path',
      defaultPath: `${getAppDataPath('sql')}`,
      buttonLabel: 'Save',
      filters: [{ name: 'SQL', extensions: ['sql'] }],
    };

    try {
      const filePath = await ipcRenderer.invoke('showSaveDialog', options);

      const payload = {
        db,
        filePath,
      };

      await ipcRenderer.invoke('export-db', payload, dbType);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SidebarListItem
      $customSelected={isSelected}
      onClick={() => select(db, dbType)}
    >
      <StyledListItemText primary={`${db} [${dbType}]`} />
      <ListItemSecondaryAction>
        <Tooltip title="Export Database">
          <IconButton edge="end" onClick={handleExportDB} size="large">
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Copy Database">
          <IconButton edge="end" onClick={duplicate} size="large">
            <FileCopyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Drop Database">
          <IconButton
            edge="end"
            onClick={() => setIsDeleteDialogOpen(true)}
            size="large"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle style={{ color: 'black' }} id="alert-dialog-title">
            Confirm deletion
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete the database {db}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setIsDeleteDialogOpen(false)}
              color="primary"
            >
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
}

export default DbEntry;
