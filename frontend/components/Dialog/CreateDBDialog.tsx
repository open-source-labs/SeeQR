import React, { useState } from 'react';
import { DatabaseInfo, DBType } from '../../types';
import { IpcRendererEvent, ipcRenderer } from 'electron';
import styled from 'styled-components';
import { TextField, Box, InputLabel, Select, DialogTitle } from '@material-ui/core/';
import { Button, Dialog, FormControl, MenuItem, Tooltip } from '@mui/material';
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

const DBDialogBase = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

interface CreateDBDialogProps {
    show: boolean;
    DBInfo: Array<DatabaseInfo> | undefined;
    onClose: () => void;
}

const CreateDBDialog = function({show, DBInfo, onClose}) {
    if(!show) return (<></>);

    const [newDbName, setNewDbName] = useState('');
    const [isError, setIsError] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    const dbNames = DBInfo?.map((dbi: DatabaseInfo) => dbi.db_name);

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
    }
    else {
      setIsError(false);
    }
    setNewDbName(dbSafeName);
  };

    const handleSubmit = () => {
        //it needs to be as any because otherwise typescript thinks it doesn't have a 'value' param idk why
        const dbt: DBType = (document.getElementById('dbTypeDropdown') as any).value;
        
        ipcRenderer
        .invoke(
            'initialize-db',
            {
                newDbName: newDbName,
            },
            dbt
        )
        .then(() => {
            handleClose();
        })
        .catch((err) => {
            sendFeedback({
            type: 'error',
            message: err ?? 'Failed to initialize db',
            });
        });
    }

    return (
        <div>
        <Dialog
        fullWidth
        maxWidth="xs"
        onClose={handleClose}
        aria-labelledby="modal-title"
        open={show}
        >
        <TextFieldContainer>
            <DialogTitle id="alert-dialog-title">
            Create New Database
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

            {/* <StyledDropdown
            labelId="dbtype-select-label"
            id="dbtype-select"
            value={DBType.Postgres}
            label="Database Type"
            onChange={handleChangeDB}
            >
                <StyledMenuItem value={DBType.Postgres}>Postgres</StyledMenuItem>
                <StyledMenuItem value={DBType.MySQL}>MySQL</StyledMenuItem>
            </StyledDropdown> */}

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
            onClick={isEmpty || isError ? () => {} : handleSubmit}
            >
            Confirm
            </StyledButton>
        </ButtonContainer>
        </Dialog>
        </div>
    );
}

export default CreateDBDialog;