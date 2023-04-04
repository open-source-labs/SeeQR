import React, { useState, useEffect } from 'react';
import { DatabaseInfo, DBType } from '../../types';
import { IpcRendererEvent, ipcRenderer } from 'electron';
import styled from 'styled-components';
import {
  TextField,
  Box,
  InputLabel,
  Select,
  DialogTitle,
} from '@material-ui/core/';
import {
  Button,
  Dialog,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Tooltip,
} from '@mui/material';
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
import { Visibility, VisibilityOff } from '@mui/icons-material';

const requestConfig = once(() => {
  // console.log('is this running once?');
  return ipcRenderer.invoke('get-config');
});

interface ConfigViewProps {
  show: boolean;
  onClose: () => void;
}
const initialConfigState = { user: '', pass: '', port: 1 };

const ConfigView = ({ show, onClose }: ConfigViewProps) => {
  const [mysql, setmysql] = useState(initialConfigState);
  const [pg, setpg] = useState(initialConfigState);
  const [rds_mysql, setrds_mysql] = useState({
    ...initialConfigState,
    host: '',
  });
  const [rds_pg, setrds_pg] = useState({ ...initialConfigState, host: '' });

  const [mysql_showpass, setMySQL_ShowPass] = useState(false);
  const [pg_showpass, setPG_ShowPass] = useState(false);
  const [rds_mysql_showpass, setRDS_MySQL_ShowPass] = useState(false);
  const [rds_pg_showpass, setRDS_PG_ShowPass] = useState(false);

  useEffect(() => {
    // Listen to backend for updates to list of available databases
    const configFromBackend = (evt: IpcRendererEvent, config) => {
      setmysql({ ...config.mysql });
      setpg({ ...config.pg });
      setrds_mysql({ ...config.rds_mysql });
      setrds_pg({ ...config.rds_pg });
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
      .invoke('set-config', {
        mysql: { ...mysql },
        pg: { ...pg },
        rds_mysql: { ...rds_mysql },
        rds_pg: { ...rds_pg },
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
  };

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
          <DialogTitle id="alert-dialog-title">Configure SeeQR</DialogTitle>

          <StyledTextField
            required
            id="filled-basic"
            label="MySQL Username"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setmysql({ ...mysql, user: event.target.value });
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={mysql.user}
          />

          <StyledTextField
            required
            id="filled-basic"
            label="MySQL Password"
            size="small"
            variant="outlined"
            type={mysql_showpass ? 'text' : 'password'}
            onChange={(event) => {
              setmysql({ ...mysql, pass: event.target.value });
            }}
            InputProps={{
              style: { color: '#575151' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setMySQL_ShowPass(!mysql_showpass)}
                    onMouseDown={() => setMySQL_ShowPass(!mysql_showpass)}
                  >
                    {mysql_showpass ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            defaultValue={mysql.pass}
          />

          <StyledTextField
            required
            id="filled-basic"
            label="MySQL Port"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setmysql({ ...mysql, port: parseInt(event.target.value) });
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={mysql.port}
          />

          <StyledTextField
            required
            id="filled-basic"
            label="Postgres Username"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setpg({ ...pg, user: event.target.value });
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={pg.user}
          />

          <StyledTextField
            required
            id="filled-basic"
            label="Postgres Password"
            size="small"
            variant="outlined"
            type={pg_showpass ? 'text' : 'password'}
            onChange={(event) => {
              setpg({ ...pg, password: event.target.value });
            }}
            InputProps={{
              style: { color: '#575151' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setPG_ShowPass(!pg_showpass)}
                    onMouseDown={() => setPG_ShowPass(!pg_showpass)}
                  >
                    {pg_showpass ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            defaultValue={pg.pass}
          />

          <StyledTextField
            required
            id="filled-basic"
            label="Postgres Port"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setpg({ ...pg, port: parseInt(event.target.value) });
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={pg.port}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS MySQL User"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setrds_mysql({ ...rds_mysql, user: event.target.value });
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={rds_mysql.user}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS MySQL Password"
            size="small"
            variant="outlined"
            type={rds_mysql_showpass ? 'text' : 'password'}
            onChange={(event) => {
              setrds_mysql({ ...rds_mysql, password: event.target.value });
            }}
            InputProps={{
              style: { color: '#575151' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setRDS_MySQL_ShowPass(!rds_mysql_showpass)}
                    onMouseDown={() =>
                      setRDS_MySQL_ShowPass(!rds_mysql_showpass)
                    }
                  >
                    {rds_mysql_showpass ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            defaultValue={rds_mysql.pass}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS MySQL Hostname"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setrds_mysql({ ...rds_mysql, host: event.target.value });
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={rds_mysql.host}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS MySQL Port"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setrds_mysql({
                ...rds_mysql,
                port: parseInt(event.target.value),
              });
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={rds_mysql.port}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS PG User"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setrds_pg({ ...rds_pg, user: event.target.value });
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={rds_pg.user}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS PG Password"
            size="small"
            variant="outlined"
            type={rds_pg_showpass ? 'text' : 'password'}
            onChange={(event) => {
              setrds_pg({ ...rds_pg, password: event.target.value });
            }}
            InputProps={{
              style: { color: '#575151' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setRDS_PG_ShowPass(!rds_pg_showpass)}
                    onMouseDown={() => setRDS_PG_ShowPass(!rds_pg_showpass)}
                  >
                    {rds_pg_showpass ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            defaultValue={rds_pg.pass}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS PG Hostname"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setrds_pg({ ...rds_pg, host: event.target.value });
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={rds_pg.host}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS PG Port"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setrds_pg({ ...rds_pg, port: parseInt(event.target.value) });
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={rds_pg.port}
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
