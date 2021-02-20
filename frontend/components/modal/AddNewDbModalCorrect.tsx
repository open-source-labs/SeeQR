import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Divider,
  Tooltip,
} from '@material-ui/core/';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import styled from 'styled-components';
import { ipcRenderer, remote } from 'electron';
import { sendFeedback } from '../../lib/utils';

const { dialog } = remote;

interface ImportPayload {
  newDbName: string;
  filePath: string;
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
  justify-content: center;
`;

// Styled Button
const StyledButton = styled(Button)`
  margin: 20px;
  padding: 8px 2px;
  width: 40%;
  height: 10%;
  size: small;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const StyledTextField = styled(TextField)`
  width: 80%;
`;

type AddNewDbModalProps = {
  open: boolean;
  onClose: () => void;
  databases: string[];
};

const AddNewDbModal = ({ open, onClose, databases }: AddNewDbModalProps) => {
  const [newDbName, setNewDbName] = useState('');
  const [isError, setIsError] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Resets state for error messages
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
  const handleDbName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dbNameInput = event.target.value;
    if (dbNameInput.length === 0) {
      setIsEmpty(true);
    } else {
      setIsEmpty(false);
    }
    // check if the newDbName is not a duplicate
    let dbSafeName = dbNameInput;
     // convert input label name to lowercase only with no spacing to comply with db naming convention.
    dbSafeName = dbSafeName.replace(/[^\w-]/gi, '');
    if (databases.includes(dbSafeName)) {
      setIsError(true);
    } else {
      setIsError(false);
    }
    setNewDbName(dbSafeName);
  };

  // Opens modal to select file and sends the selected file to backend
  const handleFileClick = () => {
    dialog
      .showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Custom File Type', extensions: ['sql', 'tar'] }],
        message: 'Please upload .sql or .tar database file',
      })
      .then((result) => {
        if (result.canceled) return;

        if (!result.filePaths.length) {
          sendFeedback({
            type: 'warning',
            message: 'No file was selected',
          });
          return;
        }

        if (!/\w+/.test(newDbName)) {
          sendFeedback({
            type: 'warning',
            message: 'Invalid Database name given. File was not imported.',
          });
          return;
        }

        const payload: ImportPayload = {
          newDbName,
          filePath: result.filePaths[0],
        };

        ipcRenderer.invoke('import-db', payload).catch(() =>
          sendFeedback({
            type: 'error',
            message: 'Failed to import database',
          })
        );
      })
      .catch((err: object) => {
        console.log(err);
      })
      .finally(handleClose);
  };

  return (
    <div>
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={handleClose}
        aria-labelledby="modal-title"
        open={open}
      >
        <TextFieldContainer>
          <DialogTitle id="alert-dialog-title">
            Import Existing SQL or TAR File
          </DialogTitle>
          <Divider variant="middle" flexItem />
          <Tooltip title="Any special characters will be removed">
            <StyledTextField
              required
              error={isError}
              helperText={errorMessage()}
              id="filled-basic"
              label="Enter a database name"
              size="small"
              variant="outlined"
              onChange={handleDbName}
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
          <Tooltip title=".sql format only">
            <StyledButton
              variant="contained"
              color="primary"
              startIcon={<CloudUploadIcon />}
              onClick={isEmpty || isError ? () => {} : handleFileClick}
            >
              Import File
            </StyledButton>
          </Tooltip>
        </ButtonContainer>
      </Dialog>
    </div>
  );
};

export default AddNewDbModal;
