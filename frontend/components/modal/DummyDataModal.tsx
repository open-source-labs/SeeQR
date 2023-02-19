import React, { useState } from 'react';
import { Dialog } from '@mui/material';
import { ipcRenderer } from 'electron';
import {
  ButtonContainer,
  TextFieldContainer,
  StyledButton,
  StyledTextField,
  StyledDialogTitle,
} from '../../style-variables';
import { sendFeedback } from '../../lib/utils';
import { DBType } from '../../types';

interface DummyPayload {
  dbName: string;
  tableName: string;
  rows: number;
}

type DummyDataModalProps = {
  open: boolean;
  onClose: () => void;
  dbName: string | undefined;
  tableName: string | undefined;
  curDBType: DBType | undefined;
};

const DummyDataModal = ({
  open,
  onClose,
  dbName,
  tableName,
  curDBType
}: DummyDataModalProps) => {
  const [rowNum, setRowNum] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  console.log('curDBType:', curDBType);


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
    let localIsEmpty = false;
    let localIsError = false;
    const targetValue = event.target.value;

    // invalid input - empty
    if (targetValue.length === 0) {
      localIsEmpty = true;
    }
    // invalid input - not a number
    if (!/^\d+$/.test(targetValue)) {
      localIsError = true;
    }

    setIsEmpty(localIsEmpty);
    setIsError(localIsError);
    if (!localIsEmpty && !localIsError) {
      setRowNum(Number(targetValue));
    }
  };

  // Event handler to send rows to backend
  const handleClick = () => {
    // Check if dbName is given and not undefined
    if (!dbName || !tableName)
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
    .invoke('generate-dummy-data', payload, curDBType)
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
          <StyledDialogTitle id="alert-dialog-title">
            Generate Dummy Data into Table
          </StyledDialogTitle>

          <StyledTextField
            error={isError}
            helperText={errorMessage()}
            id="filled-basic"
            label="Enter # of Rows to Generate"
            size="small"
            variant="outlined"
            onChange={handleRowChange}
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
            onClick={isError || isEmpty ? () => {} : handleClick}
          >
            Generate
          </StyledButton>
        </ButtonContainer>
      </Dialog>
    </div>
  );
};

export default DummyDataModal;
