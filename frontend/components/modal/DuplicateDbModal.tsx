import React, { useState } from 'react';
import {
  MuiThemeProvider,
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core/';
import { MuiTheme } from '../../style-variables';

const { ipcRenderer } = window.require('electron');

type copyDbModalProps = {
  open: boolean;
  onClose: () => void;
  dbCopyName: string;
};

const DuplicateDbModal = ({
  open,
  onClose,
  dbCopyName,
}: copyDbModalProps) => {
  const [checked, setChecked] = useState(true);
  const [newSchemaName, setNewSchemaName] = useState('');

  // open/close modal function
  const handleClose = () => {
    onClose();
  };

  // Set schema name
  const handleSchemaName = (event: React.ChangeEvent<HTMLInputElement>) => {
    // convert input label name to lowercase only with no spacing to comply with db naming convention.
    const schemaNameInput = event.target.value;
    let dbSafeName = schemaNameInput.toLowerCase();
    dbSafeName = dbSafeName.replace(/[^A-Z0-9]/gi, '');
    setNewSchemaName(dbSafeName);
  };

  const handleCopyData = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const handleCopyFilePath = () => {
    const schemaObj = {
      schemaName: newSchemaName,
      schemaFilePath: '',
      schemaEntry: '',
      dbCopyName,
      copy: checked,
    };

    ipcRenderer.send('input-schema', schemaObj);
    setNewSchemaName(' ');
    handleClose();
  };

  return (
    <div>
      <MuiThemeProvider theme={MuiTheme}>
        <Dialog onClose={handleClose} aria-labelledby="modal-title" open={open}>
          <DialogTitle id="alert-dialog-title">
            Enter a schema name:
          </DialogTitle>
          <TextField
            required
            id="filled-required"
            label="Required"
            variant="filled"
            defaultValue={`${dbCopyName}_copy`}
            onChange={handleSchemaName}
          />
          <FormControlLabel
            control={(
              <Checkbox
                checked={checked}
                onChange={handleCopyData}
                color="primary"
              />
            )}
            label="Copy data"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCopyFilePath}
          >
            Create Copy
          </Button>
        </Dialog>
      </MuiThemeProvider>
    </div>
  );
};

export default DuplicateDbModal;
