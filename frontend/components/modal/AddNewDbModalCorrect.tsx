import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  Typography,
  TextField,
  Button,
  Divider,
  Tooltip,
} from '@material-ui/core/';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import styled from 'styled-components';

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

const { dialog } = require('electron').remote;

const { ipcRenderer } = window.require('electron');

type AddNewDbModalProps = {
  open: boolean;
  onClose: () => void;
  databases: string[];
};

const AddNewDbModal = ({ open, onClose, databases }: AddNewDbModalProps) => {
  const [newDbName, setNewDbName] = useState('');
  const [isError, setIsError] = useState(false);

  const handleClose = () => {
    setIsError(false);
    onClose();
  };

  // Set schema name
  const handleDbName = (event: React.ChangeEvent<HTMLInputElement>) => {
    // convert input label name to lowercase only with no spacing to comply with db naming convention.
    const dbNameInput = event.target.value;
    // check if the newDbName is not a duplicate
    let dbSafeName = dbNameInput;
    dbSafeName = dbSafeName.replace(/[^\w-]/gi, '');
    databases.includes(dbSafeName) ? setIsError(true) : setIsError(false);
    setNewDbName(dbSafeName);
  };

  const handleFileClick = () => {
    dialog
      .showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Custom File Type', extensions: ['sql'] }],
        message: 'Please upload .sql database file',
      })
      .then((result: object) => {
        const filePathArr = result['filePaths'];

        // send via channel to main process
        if (!result['canceled']) {
          ipcRenderer.send('input-schema', {
            schemaName: newDbName,
            schemaFilePath: filePathArr,
          });
          return handleClose();
        }
      })
      .catch((err: object) => {
        // TODO: Error handling
        console.log(err);
      });
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
            Import Existing SQL File
          </DialogTitle>
          <Divider variant="middle" flexItem />
          <Tooltip title="Any special characters will be removed">
            <StyledTextField
              required
              error={isError}
              helperText={
                isError
                  ? 'This database name already exists. Please enter a unique name.'
                  : ''
              }
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
              onClick={isError ? () => {} : handleFileClick}
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
