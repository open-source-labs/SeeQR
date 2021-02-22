import React, { useState } from 'react';
import { Dialog, DialogTitle, TextField, Button } from '@material-ui/core/';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';

import { sendFeedback } from '../../lib/utils';

interface DummyPayload {
  dbName: string;
  tableName: string;
  rows: number;
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

type DummyDataModalProps = {
  open: boolean;
  onClose: () => void;
  dbName: string | undefined;
  tableName: string | undefined;
};

const DummyDataModal = ({
  open,
  onClose,
  dbName,
  tableName,
}: DummyDataModalProps) => {
  const [rowNum, setRowNum] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClose = () => {
    setIsError(false);
    setIsEmpty(true);
    onClose();
  };

  // Error message depending on if the text field is empty or a duplicate
  const errorMessage = () => {
    if (isEmpty && isError) {
      return 'Number of rows cannot be empty and must be a number';
    }
    if (isEmpty) {
      return 'Required: Number of rows cannot be empty';
    }
    if (isError) {
      return 'Please enter a number';
    }
    return '';
  };

  // Event handler for text area changes
  const handleRowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetValue = event.target.value;
    const rowNumInput = parseInt(event.target.value, 10);

    // checks for valid number input
    if (rowNumInput) {
      setIsEmpty(false);
      setIsError(false);
    }
    // invalid input - not a number
    if (Number.isNaN(rowNumInput)) {
      setIsError(true);
    }
    // invalid input - empty
    if (targetValue.length === 0) {
      setIsEmpty(true);
    } else {
      setIsEmpty(false);
    }

    setRowNum(rowNumInput);
  };

  // Event handler to send rows to backend
  const handleClick = () => {
    // Check if dbName is given and not undefined
    if (!dbName)
      return sendFeedback({
        type: 'error',
        message: 'Failed to generate dummy data',
      });

    // Check if tableName is given and not undefined
    if (!tableName)
      return sendFeedback({
        type: 'error',
        message: 'Failed to generate dummy data',
      });

    const payload: DummyPayload = {
      dbName,
      tableName,
      rows: rowNum,
    };

    ipcRenderer
      .invoke('generate-dummy-data', payload)
      .catch(() =>
        sendFeedback({
          type: 'error',
          message: 'Failed to generate dummy data',
        })
      )
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
            Generate Dummy Data into Table
          </DialogTitle>
          <StyledTextField
            error={isError}
            helperText={errorMessage()}
            id="filled-basic"
            label="Enter # of Rows to Generate"
            size="small"
            variant="outlined"
            onChange={handleRowChange}
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
            onClick={isError || isEmpty ? () => {} : handleClick}
          >
            Generate Dummy Data
          </StyledButton>
        </ButtonContainer>
      </Dialog>
    </div>
  );
};

export default DummyDataModal;
