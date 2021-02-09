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
import styled from 'styled-components'
import { MuiTheme } from '../../style-variables';

const { ipcRenderer } = window.require('electron');

const StyledButton = styled(Button)`
  margin: 8px;
  padding: 8px;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
`;

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
          <StyledButton
            variant="contained"
            color="primary"
            onClick={handleCopyFilePath}
          >
            Create Copy
          </StyledButton>
        </Dialog>
      </MuiThemeProvider>
    </div>
  );
};

export default DuplicateDbModal;
