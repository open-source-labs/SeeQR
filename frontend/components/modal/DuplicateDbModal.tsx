import React, { useState } from 'react';
import {
  MuiThemeProvider,
  Dialog,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from '@material-ui/core/';
import { sendFeedback } from '../../lib/utils';
import {
  ButtonContainer,
  TextFieldContainer,
  StyledButton,
  StyledTextField,
  MuiTheme,
  StyledDialogTitle,
} from '../../style-variables';

const { ipcRenderer } = window.require('electron');

interface DuplicatePayload {
  newName: string;
  sourceDb: string;
  withData: boolean;
}

type copyDbModalProps = {
  open: boolean;
  onClose: () => void;
  dbCopyName: string;
  databases: string[];
};

const handleDBName = (dbCopyName, databases) => {
  // use regex to separate the number
  // increment only the digit
  let dbName = dbCopyName;
  for (let i = 1; i < Infinity; i += 1) {
    if (databases.includes(dbName)) {
      dbName = dbCopyName;
      dbName = dbName.concat(`_${i}`);
    } else {
      break;
    }
  }
  return dbName;
};

const DuplicateDbModal = ({
  open,
  onClose,
  dbCopyName,
  databases,
}: copyDbModalProps) => {
  const [checked, setChecked] = useState(true);
  const [newSchemaName, setNewSchemaName] = useState(
    handleDBName(dbCopyName, databases)
  );
  const [isError, setIsError] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  // open/close modal function
  const handleClose = () => {
    setIsError(false);
    setIsEmpty(true);
    onClose();
  };

  // Error message depending on if the text field is empty or a duplicate
  const errorMessage = () => {
    if (isEmpty) {
      return 'Required: Database must have a name. Please enter a unique name.';
    }
    if (isError) {
      return 'This database name already exists. Please enter a unique name.';
    }
    return '';
  };

  // Set schema name
  const handleSchemaName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const schemaNameInput = event.target.value;
    if (schemaNameInput.length === 0) {
      setIsEmpty(true);
    } else {
      setIsEmpty(false);
    }
    let dbSafeName = schemaNameInput;
    // convert input label name to lowercase only with no spacing to comply with db naming convention.
    dbSafeName = dbSafeName.replace(/[^\w-]/gi, '');
    if (databases.includes(dbSafeName)) {
      setIsError(true);
    } else {
      setIsError(false);
    }
    // dbSafeName = dbSafeName.replace(/[^A-Z0-9]/gi, '');
    // check if the newSchemaName is not a duplicate
    setNewSchemaName(dbSafeName);
  };

  const handleCopyData = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const handleCopyFilePath = () => {
    const schemaObj: DuplicatePayload = {
      newName: newSchemaName,
      sourceDb: dbCopyName,
      withData: checked,
    };
    ipcRenderer
      .invoke('duplicate-db', schemaObj)
      .catch(() => {
        sendFeedback({
          type: 'error',
          message: 'Failed to duplicate database',
        });
      })
      .finally(() => {
        setNewSchemaName(' ');
        handleClose();
      });
  };

  return (
    <div>
      <MuiThemeProvider theme={MuiTheme}>
        <Dialog
          fullWidth
          maxWidth="xs"
          onClose={handleClose}
          aria-labelledby="modal-title"
          open={open}
        >
          <TextFieldContainer>
            <StyledDialogTitle id="alert-dialog-title">
              Copy Existing Database
            </StyledDialogTitle>
            <Tooltip
              title={
                checked ? 'Deselect to only copy shell' : 'Select to copy data'
              }
            >
              <FormControlLabel
                control={
                  // eslint-disable-next-line react/jsx-wrap-multilines
                  <Checkbox
                    checked={checked}
                    onChange={handleCopyData}
                    color="primary"
                  />
                }
                label="Copy data"
              />
            </Tooltip>
            <StyledTextField
              required
              error={isError || isEmpty}
              helperText={errorMessage()}
              id="filled-required"
              label="Enter a database copy name"
              variant="outlined"
              defaultValue={newSchemaName}
              onChange={handleSchemaName}
              InputProps={{
                style: { color: '#575151' },
              }}
            />
          </TextFieldContainer>
          <ButtonContainer>
            <StyledButton
              variant="contained"
              color="secondary"
              onClick={handleClose}
            >
              Cancel
            </StyledButton>
            <StyledButton
              variant="contained"
              color="primary"
              onClick={isEmpty || isError ? () => {} : handleCopyFilePath}
            >
              Copy
            </StyledButton>
          </ButtonContainer>
        </Dialog>
      </MuiThemeProvider>
    </div>
  );
};

export default DuplicateDbModal;
