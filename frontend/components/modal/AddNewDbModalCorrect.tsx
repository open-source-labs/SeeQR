import React, { useState } from 'react';
import { Dialog, DialogTitle, Tooltip } from '@material-ui/core/';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { ipcRenderer, remote } from 'electron';
import { sendFeedback } from '../../lib/utils';
import {
  ButtonContainer,
  TextFieldContainer,
  StyledButton,
  StyledTextField,
  DropdownContainer,
  StyledDropdown,
  StyledMenuItem,
  StyledInputLabel,
  StyledNativeDropdown,
  StyledNativeOption,
} from '../../style-variables';
import { DBType } from '../../../backend/BE_types';

const { dialog } = remote;

interface ImportPayload {
  newDbName: string;
  filePath: string;
}

type AddNewDbModalProps = {
  open: boolean;
  onClose: () => void;
  dbNames: string[] | undefined;
  curDBType: DBType | undefined;
};

const AddNewDbModal = ({
  open,
  onClose,
  dbNames,
  curDBType,
}: AddNewDbModalProps) => {
  const [newDbName, setNewDbName] = useState('');
  const [isError, setIsError] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  // const [curDBType, setDBType] = useState<DBType>();

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
    if (dbNames?.includes(dbSafeName)) {
      setIsError(true);
    } else {
      setIsError(false);
    }
    setNewDbName(dbSafeName);
  };

  // Opens modal to select file and sends the selected file to backend
  const handleFileClick = () => {
    const dbt: DBType = (document.getElementById('dbTypeDropdown') as any).value;
    // console.log('curDBType in addnewdbmodalcorrect', curDBType)
    // console.log('newdbName in addnewdbmodalcorrect', newDbName)
    // console.log('dbt in addnewdbmodalcorrect', dbt)
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

        const payload: ImportPayload = {
          newDbName,
          filePath: result.filePaths[0],
        };


        ipcRenderer.invoke('import-db', payload, dbt).catch(() =>
          sendFeedback({
            type: 'error',
            message: 'Failed to import database',
          })
        );
      })
      .catch((err: object) => {
        // console.log(err);
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
              InputProps={{
                style: { color: '#575151' },
              }}
            />
          </Tooltip>
        </TextFieldContainer>
        <DropdownContainer>
          <StyledInputLabel id="dbtype-select-label" variant="standard" htmlFor="uncontrolled-native">
            Database Type
          </StyledInputLabel>
          <StyledNativeDropdown
            id='dbTypeDropdown'
            defaultValue={DBType.Postgres}
          >
            <StyledNativeOption value={DBType.Postgres}>Postgres</StyledNativeOption>
            <StyledNativeOption value={DBType.MySQL}>MySQL</StyledNativeOption>
          </StyledNativeDropdown>
        </DropdownContainer>
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
            startIcon={<CloudUploadIcon />}
            onClick={isEmpty || isError ? () => {} : handleFileClick}
          >
            Import
          </StyledButton>
        </ButtonContainer>
      </Dialog>
    </div>
  );
};

export default AddNewDbModal;
