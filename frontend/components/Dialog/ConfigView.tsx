import React, { useState, useEffect } from 'react';
import { IpcRendererEvent, ipcRenderer } from 'electron';
import { DialogTitle } from '@material-ui/core/';
import {
  Box,
  Tab,
  Tabs,
  Dialog,
  IconButton,
  InputAdornment,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { sendFeedback, once } from '../../lib/utils';
import {
  ButtonContainer,
  TextFieldContainer,
  StyledButton,
  StyledTextField,
} from '../../style-variables';
import '../../lib/style.scss'; // OSCAR test adding style sheet

/// START OF TAB FEATURE
interface BasicTabsProps {
  onClose: () => void;
}
const initialConfigState = { user: '', password: '', port: 1 };
const requestConfig = once(() =>
  // console.log('is this running once?');
  ipcRenderer.invoke('get-config')
);
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, color: 'red' }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
const styledTextField = (
  <StyledTextField
    required
    id="filled-basic"
    size="small"
    variant="outlined"
    type={showpass ? 'text' : 'password'}
    onChange={(event) => {
      const newState = { ...dbTypeFromState };
      newState[dbEntryKey] = event.target.value;
      setDbTypeFromState(newState);
    }}
    InputProps={{
      style: { color: '#575151' },
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle password visibility"
            onClick={() => setShowpass(!showpass)}
            onMouseDown={() => setShowpass(!showpass)}
          >
            {showpass ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </InputAdornment>
      ),
    }}
    defaultValue={dbEntryValue}
  />
);
const BasicTabs = ({ onClose }: BasicTabsProps) => {
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
  const [value, setValue] = useState(0);
  const [showpass, setShowpass] = useState(false);
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
    // it needs to be as any because otherwise typescript thinks it doesn't have a 'value' param idk why
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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const inputFields = { mysql: [], pg: [], rds_mysql: [], rds_pg: [] };

  function inputBoxMaker(dbTypeFromState, setDbTypeFromState, dbString) {
    Object.entries(dbTypeFromState).forEach((entry) => {
      const dbEntryKey = entry[0];
      const dbEntryValue = entry[1];

      if (dbEntryKey === 'password' || dbEntryKey === 'pass') {
        inputFields[dbString].push(
          <StyledTextField
            required
            id="filled-basic"
            label={`${dbTypeFromState} Password`}
            size="small"
            variant="outlined"
            type={showpass ? 'text' : 'password'}
            onChange={(event) => {
              const newState = { ...dbTypeFromState };
              newState[dbEntryKey] = event.target.value;
              setDbTypeFromState(newState);
            }}
            InputProps={{
              style: { color: '#575151' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowpass(!showpass)}
                    onMouseDown={() => setShowpass(!showpass)}
                  >
                    {showpass ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            defaultValue={dbEntryValue}
          />
        );
      } else {
        inputFields[dbString].push(
          <StyledTextField
            required
            id="filled-basic"
            label={`MySQL ${dbEntryKey}`}
            size="small"
            variant="outlined"
            onChange={(event) => {
              const newState = { ...dbTypeFromState };
              newState[dbEntryKey] = event.target.value;
              setDbTypeFromState(newState);
            }}
            InputProps={{
              style: { color: '#575151' },
            }}
            defaultValue={dbEntryValue}
          />
        );
      }
    });
  }
  inputBoxMaker(pg, setpg, 'pg');
  inputBoxMaker(mysql, setmysql, 'mysql');
  inputBoxMaker(rds_pg, setrds_pg, 'rds_pg');
  inputBoxMaker(rds_mysql, setrds_mysql, 'rds_mysql');

  console.log(inputFields);
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="wrapped label basic tabs example"
        >
          <Tab label="MySql" {...a11yProps(0)} />
          <Tab label="Postgres" {...a11yProps(1)} />
          <Tab label="RDS MySql" wrapped {...a11yProps(2)} />
          <Tab label="RDS Postgres" wrapped />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        {inputFields.mysql}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {inputFields.pg}
      </TabPanel>
      <TabPanel value={value} index={2}>
        {inputFields.rds_mysql}
      </TabPanel>
      <TabPanel value={value} index={3}>
        {inputFields.rds_pg}
      </TabPanel>

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
    </Box>
  );
};
// END OF TAB Feature

interface ConfigViewProps {
  show: boolean;
  onClose: () => void;
}

const ConfigView = ({ show, onClose }: ConfigViewProps) => {
  const handleClose = () => {
    onClose();
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
        <BasicTabs onClose={onClose} />
      </Dialog>
    </div>
  );
};

export default ConfigView;
