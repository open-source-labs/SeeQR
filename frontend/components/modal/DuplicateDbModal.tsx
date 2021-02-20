import React, { useState } from 'react';
import {
  MuiThemeProvider,
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from '@material-ui/core/';
import styled from 'styled-components';
import { MuiTheme } from '../../style-variables';
import { sendFeedback } from '../../lib/utils';

const { ipcRenderer } = window.require('electron');

interface DuplicatePayload {
  newName: string;
  sourceDb: string;
  withData: boolean;
}

// Button Container
const ButtonContainer = styled('div')`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`;

// TextField Container
const TextFieldContainer = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

// Styled Button
const StyledButton = styled(Button)`
  margin: 5px 20px 20px 20px;
  padding: 8px 2px;
  width: 40%;
  height: 10%;
  size: small;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const StyledTextField = styled(TextField)`
  width: 80%;
`;

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
            <DialogTitle id="alert-dialog-title">
              Copy Existing Database
            </DialogTitle>
            <StyledTextField
              required
              error={isError || isEmpty}
              helperText={errorMessage()}
              id="filled-required"
              label="Enter a database copy name"
              variant="outlined"
              defaultValue={newSchemaName}
              onChange={handleSchemaName}
            />
            <Tooltip
              title={
                checked ? 'Deselect to only copy shell' : 'Select to copy data'
              }
            >
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
            </Tooltip>
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
              Create Copy
            </StyledButton>
          </ButtonContainer>
        </Dialog>
      </MuiThemeProvider>
    </div>
  );
};

export default DuplicateDbModal;
