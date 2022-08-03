import React, { useState, useEffect } from 'react';
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
import { once } from '../../lib/utils';
const requestConfig = once(() => ipcRenderer.invoke('get-config'));

interface ConfigViewProps {
    show: boolean;
    onClose: () => void;
}

const ConfigView = ({ show, onClose }: ConfigViewProps) => {

  const [mysql_user, setMySQL_User] = useState('');
  const [mysql_pass, setMySQL_Pass] = useState('');
  const [mysql_port, setMySQL_Port] = useState('');
  const [pg_user, setPG_User] = useState('');
  const [pg_pass, setPG_Pass] = useState('');
  const [pg_port, setPG_Port] = useState('');

  useEffect(() => {
    // Listen to backend for updates to list of available databases
    const configFromBackend = (evt: IpcRendererEvent, config) => {
      setMySQL_User(config.mysql_user);
      setMySQL_Pass(config.mysql_pass);
      setMySQL_Port(config.mysql_port);

      setPG_User(config.pg_user);
      setPG_Pass(config.pg_pass);
      setPG_Port(config.pg_port);
    };
    ipcRenderer.on('get-config', configFromBackend);
    requestConfig();
    // return cleanup function
    return () => {
      ipcRenderer.removeListener('get-config', configFromBackend);
    };
  });

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    //it needs to be as any because otherwise typescript thinks it doesn't have a 'value' param idk why
    ipcRenderer
    .invoke('set-config', 
    {
      mysql_user,
      mysql_pass,
      mysql_port: parseInt(mysql_port),
      pg_user,
      pg_pass,
      pg_port: parseInt(pg_port)
    })
    .then(() => {
        handleClose();
    })
    .catch((err) => {
        sendFeedback({
        type: 'error',
        message: err ?? 'Failed to save config.',
        });
    });
}

  if (!show) return null;
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
            Configure SeeQR
            </DialogTitle>
            
            <StyledTextField
                required
                id="filled-basic"
                label="MySQL Username"
                size="small"
                variant="outlined"
                onChange={(event) => {setMySQL_User(event.target.value)}}
                InputProps={{
                style: { color: '#575151' },
                }}
                defaultValue={mysql_user}
            />

              <StyledTextField
                required
                id="filled-basic"
                label="MySQL Password"
                size="small"
                variant="outlined"
                onChange={(event) => {setMySQL_Pass(event.target.value)}}
                InputProps={{
                style: { color: '#575151' },
                }}
                defaultValue={mysql_pass}
              />

              <StyledTextField
                required
                id="filled-basic"
                label="MySQL Port"
                size="small"
                variant="outlined"
                onChange={(event) => {setMySQL_Port(event.target.value)}}
                InputProps={{
                style: { color: '#575151' },
                }}
                defaultValue={mysql_port}
              />

              <StyledTextField
                required
                id="filled-basic"
                label="Postgres Username"
                size="small"
                variant="outlined"
                onChange={(event) => {setPG_User(event.target.value)}}
                InputProps={{
                style: { color: '#575151' },
                }}
                defaultValue={pg_user}
              />

              <StyledTextField
                required
                id="filled-basic"
                label="Postgres Password"
                size="small"
                variant="outlined"
                onChange={(event) => {setPG_Pass(event.target.value)}}
                InputProps={{
                style: { color: '#575151' },
                }}
                defaultValue={pg_pass}
              />

              <StyledTextField
                required
                id="filled-basic"
                label="Postgres Port"
                size="small"
                variant="outlined"
                onChange={(event) => {setPG_Port(event.target.value)}}
                InputProps={{
                style: { color: '#575151' },
                }}
                defaultValue={pg_port}
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
            onClick={handleSubmit}
            >
            Save
            </StyledButton>
        </ButtonContainer>

        </Dialog>
        </div>
  );
};

export default ConfigView;
