import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { IpcRendererEvent, ipcRenderer } from 'electron';
import {
  Box,
  Tab,
  Tabs,
  Dialog,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { sendFeedback } from '../../lib/utils';
import {
  ButtonContainer,
  StyledButton,
  StyledTextField,
} from '../../style-variables';
import '../../lib/style.scss'; // OSCAR test adding style sheet

/// START OF TAB FEATURE
interface BasicTabsProps {
  onClose: () => void;
}
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
// Material UI TabPanel component
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
      {value === index && <Box sx={{ p: 3, color: 'red' }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const BasicTabs = ({ onClose }: BasicTabsProps) => {
  // useState hooks for database connection information, can change specific initial values
  const [mysql, setmysql] = useState({});
  const [pg, setpg] = useState({});
  const [rds_mysql, setrds_mysql] = useState({});
  const [rds_pg, setrds_pg] = useState({});
  // Toggle TabPanel display
  const [value, setValue] = useState(0);
  // Toggle show password in input fields
  const [showpass, setShowpass] = useState(false);
  // Arrays of StyledTextField components to render in tabs
  const inputFieldsToRender = useRef({
    pg: [],
    mysql: [],
    rds_mysql: [],
    rds_pg: [],
  });

  // Function to make StyledTextFields and store them in inputFields object
  function inputFieldMaker(dbTypeFromState, setDbTypeFromState, dbString) {
    const arrayToRender: JSX.Element[] = [];
    // Get key value pairs from passed in database connection info from state
    Object.entries(dbTypeFromState).forEach((entry) => {
      const [dbEntryKey, dbEntryValue] = entry;
      // If we are rendering a password StyledTextField, then add special props
      let styledTextFieldProps;
      if (dbEntryKey === 'password') {
        styledTextFieldProps = {
          type: showpass ? 'text' : 'password',
          InputProps: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowpass(!showpass)}
                >
                  {showpass ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          },
        };
      }
      // Push StyledTextField to render array for current key in database connection object from state
      arrayToRender.push(
        <StyledTextField
          required
          id="filled-basic"
          label={`${dbString.toUpperCase()} ${dbEntryKey.toUpperCase()}`}
          size="small"
          variant="outlined"
          key={`${dbString} ${dbEntryKey}`}
          onChange={(event) => {
            // onChange update state based on current input field
            const newState = { ...dbTypeFromState };
            newState[dbEntryKey] = event.target.value;
            setDbTypeFromState(newState);
          }}
          defaultValue={dbEntryValue}
          InputProps={{
            style: { color: '#575151' },
          }}
          // Spread special password props if they exist
          {...styledTextFieldProps}
        />
      );
    });
    inputFieldsToRender.current[dbString] = arrayToRender;
  }

  useEffect(() => {
    // Listen to backend for updates to list of available databases
    const configFromBackend = (evt: IpcRendererEvent, config) => {
      // Set state based on parsed config.json object received from backend
      setmysql({ ...config.mysql });
      setpg({ ...config.pg });
      setrds_mysql({ ...config.rds_mysql });
      setrds_pg({ ...config.rds_pg });
    };
    ipcRenderer.on('get-config', configFromBackend);
    ipcRenderer.invoke('get-config');
    // return cleanup function
    return () => {
      ipcRenderer.removeListener('get-config', configFromBackend);
    };
  }, []);

  useEffect(() => {
    inputFieldMaker(pg, setpg, 'pg');
    inputFieldMaker(mysql, setmysql, 'mysql');
    inputFieldMaker(rds_pg, setrds_pg, 'rds_pg');
    inputFieldMaker(rds_mysql, setrds_mysql, 'rds_mysql');
  });

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    // Pass database connection values from state to backend
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
  // Function to change TabPanel
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setShowpass(false);
    setValue(newValue);
  };
  // Object to store StyledTextFields to render

  // Generate the StyledTextField arrays to render, passing in state, setstate hook, and hardcoded database name string

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="wrapped label basic tabs"
        >
          <Tab label="MySql" {...a11yProps(0)} />
          <Tab label="Postgres" {...a11yProps(1)} />
          <Tab label="RDS MySql" wrapped {...a11yProps(2)} />
          <Tab label="RDS Postgres" wrapped />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        {inputFieldsToRender.current.mysql}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {inputFieldsToRender.current.pg}
      </TabPanel>
      <TabPanel value={value} index={2}>
        {inputFieldsToRender.current.rds_mysql}
      </TabPanel>
      <TabPanel value={value} index={3}>
        {inputFieldsToRender.current.rds_pg}
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
