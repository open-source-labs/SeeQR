import React, { useState, useEffect } from 'react';
import { IpcRendererEvent, ipcRenderer } from 'electron';

import {
  Tab,
  Tabs,
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
import { Visibility, VisibilityOff } from '@mui/icons-material';
import "../../lib/style.scss" // OSCAR test adding style sheet
import { sendFeedback , once } from '../../lib/utils';
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

const requestConfig = once(() =>
  // console.log('is this running once?');
   ipcRenderer.invoke('get-config')
);

interface ConfigViewProps {
  show: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const a11yProps = (index: any) => ({
  id: `scrollable-auto-tab-${index}`,
  'aria-controls': `scrollable-auto-tabpanel-${index}`,
});

/* TabPanel Props include
  value
  children
  classes
*/
const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div
    role="tabpanel" // for A11y, allows screen readers to read this div as tabpanel
    hidden={value !== index}
    id={`scrollable-auto-tabpanel-${index}`}
    aria-labelledby={`scrollable-auto-tab-${index}`}
  >
    {value === index && children}
  </div>
);

const ConfigView = ({ show, onClose }: ConfigViewProps) => {
  const [mysql_user, setMySQL_User] = useState('');
  const [mysql_pass, setMySQL_Pass] = useState('');
  const [mysql_port, setMySQL_Port] = useState('');
  const [pg_user, setPG_User] = useState('');
  const [pg_pass, setPG_Pass] = useState('');
  const [pg_port, setPG_Port] = useState('');
  const [rds_mysql_user, setRDS_MySQL_User] = useState('');
  const [rds_mysql_pass, setRDS_MySQL_Pass] = useState('');
  const [rds_mysql_host, setRDS_MySQL_Host] = useState('');
  const [rds_mysql_port, setRDS_MySQL_Port] = useState('');
  const [rds_pg_user, setRDS_PG_User] = useState('');
  const [rds_pg_pass, setRDS_PG_Pass] = useState('');
  const [rds_pg_host, setRDS_PG_Host] = useState('');
  const [rds_pg_port, setRDS_PG_Port] = useState('');

  const [mysql_showpass, setMySQL_ShowPass] = useState(false);
  const [pg_showpass, setPG_ShowPass] = useState(false);
  const [rds_mysql_showpass, setRDS_MySQL_ShowPass] = useState(false);
  const [rds_pg_showpass, setRDS_PG_ShowPass] = useState(false);

  useEffect(() => {
    // Listen to backend for updates to list of available databases
    const configFromBackend = (evt: IpcRendererEvent, config) => {
      setMySQL_User(config.mysql_user);
      setMySQL_Pass(config.mysql_pass);
      setMySQL_Port(config.mysql_port);
      setPG_User(config.pg_user);
      setPG_Pass(config.pg_pass);
      setPG_Port(config.pg_port);
      setRDS_MySQL_User(config.rds_mysql_user);
      setRDS_MySQL_Pass(config.rds_mysql_pass);
      setRDS_MySQL_Host(config.rds_mysql_host);
      setRDS_MySQL_Port(config.rds_mysql_port);
      setRDS_PG_User(config.rds_pg_user);
      setRDS_PG_Pass(config.rds_pg_pass);
      setRDS_PG_Host(config.rds_pg_host);
      setRDS_PG_Port(config.rds_pg_port);
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
    // it needs to be as any because otherwise typescript thinks it doesn't have a 'value' param idk why
    ipcRenderer
      .invoke('set-config', {
        mysql_user,
        mysql_pass,
        mysql_port: parseInt(mysql_port),
        pg_user,
        pg_pass,
        pg_port: parseInt(pg_port),
        rds_mysql_user,
        rds_mysql_pass,
        rds_mysql_host,
        rds_mysql_port: parseInt(rds_mysql_port),
        rds_pg_user,
        rds_pg_pass,
        rds_pg_host,
        rds_pg_port: parseInt(rds_pg_port),
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Item One" {...a11yProps(0)} />
            <Tab label="Item Two" {...a11yProps(1)} />
            <Tab label="Item Three" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          Item One
        </TabPanel>
        <TabPanel value={value} index={1}>
          Item Two
        </TabPanel>
        <TabPanel value={value} index={2}>
          Item Three
        </TabPanel>

        <TextFieldContainer>
          <button type='button'>Press Me</button>
          {/* OSCAR TEST ABOVE */}
          <DialogTitle id="alert-dialog-title">Configure SeeQR</DialogTitle>

          <StyledTextField
            required
            id="filled-basic"
            label="MySQL Username"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setMySQL_User(event.target.value);
            }}
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
            type={mysql_showpass ? 'text' : 'password'}
            onChange={(event) => {
              setMySQL_Pass(event.target.value);
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
            defaultValue={mysql_pass}
          />

          <StyledTextField
            required
            id="filled-basic"
            label="MySQL Port"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setMySQL_Port(event.target.value);
            }}
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
            onChange={(event) => {
              setPG_User(event.target.value);
            }}
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
            type={pg_showpass ? 'text' : 'password'}
            onChange={(event) => {
              setPG_Pass(event.target.value);
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
            defaultValue={pg_pass}
          />

          <StyledTextField
            required
            id="filled-basic"
            label="Postgres Port"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setPG_Port(event.target.value);
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={pg_port}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS MySQL User"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setRDS_MySQL_User(event.target.value);
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={rds_mysql_user}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS MySQL Password"
            size="small"
            variant="outlined"
            type={rds_mysql_showpass ? 'text' : 'password'}
            onChange={(event) => {
              setRDS_MySQL_Pass(event.target.value);
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
            defaultValue={rds_mysql_pass}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS MySQL Hostname"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setRDS_MySQL_Host(event.target.value);
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={rds_mysql_host}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS MySQL Port"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setRDS_MySQL_Port(event.target.value);
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={rds_mysql_port}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS PG User"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setRDS_PG_User(event.target.value);
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={rds_pg_user}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS PG Password"
            size="small"
            variant="outlined"
            type={rds_pg_showpass ? 'text' : 'password'}
            onChange={(event) => {
              setRDS_PG_Pass(event.target.value);
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
            defaultValue={rds_pg_pass}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS PG Hostname"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setRDS_PG_Host(event.target.value);
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={rds_pg_host}
          />
          <StyledTextField
            required
            id="filled-basic"
            label="RDS PG Port"
            size="small"
            variant="outlined"
            onChange={(event) => {
              setRDS_PG_Port(event.target.value);
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={rds_pg_port}
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

    // <div>
    //   <Dialog
    //     fullWidth
    //     maxWidth="xs"
    //     onClose={handleClose}
    //     aria-labelledby="modal-title"
    //     open={show}
    //   >
    //     <TextFieldContainer>
    //       <button type='button'>Press Me</button>
    //       {/* OSCAR TEST ABOVE */}
    //       <DialogTitle id="alert-dialog-title">Configure SeeQR</DialogTitle>

    //       <StyledTextField
    //         required
    //         id="filled-basic"
    //         label="MySQL Username"
    //         size="small"
    //         variant="outlined"
    //         onChange={(event) => {
    //           setMySQL_User(event.target.value);
    //         }}
    //         InputProps={{
    //           style: { color: '#575151' },
    //         }}
    //         defaultValue={mysql_user}
    //       />

    //       <StyledTextField
    //         required
    //         id="filled-basic"
    //         label="MySQL Password"
    //         size="small"
    //         variant="outlined"
    //         type={mysql_showpass ? 'text' : 'password'}
    //         onChange={(event) => {
    //           setMySQL_Pass(event.target.value);
    //         }}
    //         InputProps={{
    //           style: { color: '#575151' },
    //           endAdornment: (
    //             <InputAdornment position="end">
    //               <IconButton
    //                 aria-label="toggle password visibility"
    //                 onClick={() => setMySQL_ShowPass(!mysql_showpass)}
    //                 onMouseDown={() => setMySQL_ShowPass(!mysql_showpass)}
    //               >
    //                 {mysql_showpass ? <Visibility /> : <VisibilityOff />}
    //               </IconButton>
    //             </InputAdornment>
    //           ),
    //         }}
    //         defaultValue={mysql_pass}
    //       />

    //       <StyledTextField
    //         required
    //         id="filled-basic"
    //         label="MySQL Port"
    //         size="small"
    //         variant="outlined"
    //         onChange={(event) => {
    //           setMySQL_Port(event.target.value);
    //         }}
    //         InputProps={{
    //           style: { color: '#575151' },
    //         }}
    //         defaultValue={mysql_port}
    //       />

    //       <StyledTextField
    //         required
    //         id="filled-basic"
    //         label="Postgres Username"
    //         size="small"
    //         variant="outlined"
    //         onChange={(event) => {
    //           setPG_User(event.target.value);
    //         }}
    //         InputProps={{
    //           style: { color: '#575151' },
    //         }}
    //         defaultValue={pg_user}
    //       />

    //       <StyledTextField
    //         required
    //         id="filled-basic"
    //         label="Postgres Password"
    //         size="small"
    //         variant="outlined"
    //         type={pg_showpass ? 'text' : 'password'}
    //         onChange={(event) => {
    //           setPG_Pass(event.target.value);
    //         }}
    //         InputProps={{
    //           style: { color: '#575151' },
    //           endAdornment: (
    //             <InputAdornment position="end">
    //               <IconButton
    //                 aria-label="toggle password visibility"
    //                 onClick={() => setPG_ShowPass(!pg_showpass)}
    //                 onMouseDown={() => setPG_ShowPass(!pg_showpass)}
    //               >
    //                 {pg_showpass ? <Visibility /> : <VisibilityOff />}
    //               </IconButton>
    //             </InputAdornment>
    //           ),
    //         }}
    //         defaultValue={pg_pass}
    //       />

    //       <StyledTextField
    //         required
    //         id="filled-basic"
    //         label="Postgres Port"
    //         size="small"
    //         variant="outlined"
    //         onChange={(event) => {
    //           setPG_Port(event.target.value);
    //         }}
    //         InputProps={{
    //           style: { color: '#575151' },
    //         }}
    //         defaultValue={pg_port}
    //       />
    //       <StyledTextField
    //         required
    //         id="filled-basic"
    //         label="RDS User"
    //         size="small"
    //         variant="outlined"
    //         onChange={(event) => {
    //           setRDS_User(event.target.value);
    //         }}
    //         InputProps={{
    //           style: { color: '#575151' },
    //         }}
    //         defaultValue={rds_user}
    //       />
    //       <StyledTextField
    //         required
    //         id="filled-basic"
    //         label="RDS Password"
    //         size="small"
    //         variant="outlined"
    //         type={rds_showpass ? 'text' : 'password'}
    //         onChange={(event) => {
    //           setRDS_Pass(event.target.value);
    //         }}
    //         InputProps={{
    //           style: { color: '#575151' },
    //           endAdornment: (
    //             <InputAdornment position="end">
    //               <IconButton
    //                 aria-label="toggle password visibility"
    //                 onClick={() => setRDS_ShowPass(!rds_showpass)}
    //                 onMouseDown={() => setRDS_ShowPass(!rds_showpass)}
    //               >
    //                 {rds_showpass ? <Visibility /> : <VisibilityOff />}
    //               </IconButton>
    //             </InputAdornment>
    //           ),
    //         }}
    //         defaultValue={rds_pass}
    //       />
    //       <StyledTextField
    //         required
    //         id="filled-basic"
    //         label="RDS Hostname"
    //         size="small"
    //         variant="outlined"
    //         onChange={(event) => {
    //           setRDS_Host(event.target.value);
    //         }}
    //         InputProps={{
    //           style: { color: '#575151' },
    //         }}
    //         defaultValue={rds_host}
    //       />
    //       <StyledTextField
    //         required
    //         id="filled-basic"
    //         label="RDS Port"
    //         size="small"
    //         variant="outlined"
    //         onChange={(event) => {
    //           setRDS_Port(event.target.value);
    //         }}
    //         InputProps={{
    //           style: { color: '#575151' },
    //         }}
    //         defaultValue={rds_port}
    //       />
    //     </TextFieldContainer>

    //     <ButtonContainer>
    //       <StyledButton
    //         variant="contained"
    //         color="secondary"
    //         onClick={handleClose}
    //       >
    //         Cancel
    //       </StyledButton>

    //       <StyledButton
    //         variant="contained"
    //         color="primary"
    //         onClick={handleSubmit}
    //       >
    //         Save
    //       </StyledButton>
    //     </ButtonContainer>
    //   </Dialog>
    // </div>
  );
};

export default ConfigView;
