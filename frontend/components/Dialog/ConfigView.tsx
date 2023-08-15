import React, { useState, useEffect, useContext } from 'react';
import { ipcRenderer } from 'electron';
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
import '../../lib/style.css';
import { DocConfigFile } from '../../../backend/BE_types';
import MenuContext from '../../state_management/Contexts/MenuContext';

/*
junaid
frontend database login component
*/

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
      {value === index && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '.25rem',
            alignItems: 'center',
            pt: 2,
          }}
        >
          {children}
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

function BasicTabs({ onClose }: BasicTabsProps) {
  // context for async calls
  const { dispatch: menuDispatch } = useContext(MenuContext);

  // useState hooks for database connection information
  const [mysql, setmysql] = useState({});
  const [pg, setpg] = useState({});
  const [rds_mysql, setrds_mysql] = useState({});
  const [rds_pg, setrds_pg] = useState({});
  const [sqlite, setSqlite] = useState({}); // added sqlite
  // Toggle TabPanel display
  const [value, setValue] = useState(0);
  // Toggle show password in input fields
  const [showpass, setShowpass] = useState({
    pg: false,
    mysql: false,
    rds_mysql: false,
    rds_pg: false,
    sqlite: false,
  });
  // Storing input StyledTextFields to render in state
  const [inputFieldsToRender, setInputFieldsToRender] = useState({
    pg: [],
    mysql: [],
    rds_mysql: [],
    rds_pg: [],
    sqlite: [], // added sqlite
  });

  // function to store user-selected file path in state
  // REVIEW:
  const designateFile = async function (path, setPath) {
    const options = {
      title: 'Select SQLite File',
      defaultPath: '',
      buttonLabel: 'Select File',
      filters: [{ name: 'db', extensions: ['db'] }],
    };
    try {
      const selectedFilePath = await ipcRenderer.invoke(
        'showOpenDialog',
        options,
      );
      setPath({ path: selectedFilePath });
    } catch (err) {
      sendFeedback({
        type: 'error',
        message: 'Error at designate file.',
      });
      console.log(`error at the designate file in ConfigView.tsx ${err}`);
    }
  };

  // Function to make StyledTextFields and store them in inputFieldsToRender state
  function inputFieldMaker(dbTypeFromState, setDbTypeFromState, dbString) {
    // Push all StyledTextFields into this temporary array
    const arrayToRender: JSX.Element[] = [];
    if (dbString === 'sqlite') {
      arrayToRender.push(
        <StyledButton
          variant="contained"
          color="primary"
          onClick={() => designateFile(dbTypeFromState, setDbTypeFromState)}
        >
          Set db file location
        </StyledButton>,
      );
    } else {
      // Get key value pairs from passed in database connection info from state
      Object.entries(dbTypeFromState).forEach((entry) => {
        // entry looks like [user: 'username'] or [password: 'password]
        const [dbEntryKey, dbEntryValue] = entry;
        // If we are rendering a password StyledTextField, then add special props
        let styledTextFieldProps;
        if (dbEntryKey === 'password') {
          styledTextFieldProps = {
            type: showpass[dbString] ? 'text' : 'password',
            InputProps: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() =>
                      setShowpass({
                        ...showpass,
                        [dbString]: !showpass[dbString],
                      })
                    }
                    size="large"
                  >
                    {showpass[dbString] ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          };
        }
        // Push StyledTextField to temporary render array for current key in database connection object from state

        arrayToRender.push(
          <StyledTextField
            required
            id="filled-basic"
            label={`${dbString.toUpperCase()} ${dbEntryKey.toUpperCase()}`}
            size="small"
            variant="outlined"
            key={`${dbString} ${dbEntryKey}`}
            onChange={(event) => {
              setDbTypeFromState({
                ...dbTypeFromState,
                [dbEntryKey]: event.target.value,
              });
            }}
            defaultValue={dbEntryValue}
            InputProps={{
              style: { color: '#575151' },
            }}
            // Spread special password props if they exist
            {...styledTextFieldProps}
          />,
        );
      });
    }
    // Update state for our current database type passing in our temporary array of StyledTextField components
    setInputFieldsToRender({
      ...inputFieldsToRender,
      [dbString]: arrayToRender,
    });
  }

  useEffect(() => {
    // Listen to backend for updates to list of available databases
    const configFromBackend = (config: DocConfigFile) => {
      // Set state based on parsed config.json object received from backend
      console.log(config);
      setmysql({ ...config.mysql_options });
      setpg({ ...config.pg_options });
      setrds_mysql({ ...config.rds_mysql_options });
      setrds_pg({ ...config.rds_pg_options });
      setSqlite({ ...config.sqlite_options }); // added sqlite
    };

    menuDispatch({
      type: 'ASYNC_TRIGGER',
      loading: 'LOADING',
      options: {
        event: 'get-config',
        callback: configFromBackend,
      },
    });
  }, [menuDispatch]);

  // Invoke functions to generate input StyledTextFields components -- passing in state, setstate hook, and database name string.
  // have it subscribed to changes in db connection info or show password button. Separate hooks to not rerender all fields each time
  useEffect(() => {
    inputFieldMaker(pg, setpg, 'pg');
  }, [pg, showpass.pg]);
  useEffect(() => {
    inputFieldMaker(mysql, setmysql, 'mysql');
  }, [mysql, showpass.mysql]);
  useEffect(() => {
    inputFieldMaker(rds_pg, setrds_pg, 'rds_pg');
  }, [rds_pg, showpass.rds_pg]);
  useEffect(() => {
    inputFieldMaker(rds_mysql, setrds_mysql, 'rds_mysql');
  }, [rds_mysql, showpass.rds_mysql]);
  useEffect(() => {
    inputFieldMaker(sqlite, setSqlite, 'sqlite'); // added sqlite
  }, [sqlite]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    // Pass database connection values from state to backend
    // OLD CODE
    // ipcRenderer
    //   .invoke('set-config', {
    //     mysql_options: { ...mysql },
    //     pg_options: { ...pg },
    //     rds_mysql_options: { ...rds_mysql },
    //     rds_pg_options: { ...rds_pg },
    //     sqlite_options: { ...sqlite }, // added sqlite
    //   })
    //   .then(() => {
    //     handleClose();
    //   })
    //   .catch((err) => {
    //     sendFeedback({
    //       type: 'error',
    //       message: err ?? 'Failed to save config.',
    //     });
    //   });

    menuDispatch({
      type: 'ASYNC_TRIGGER',
      loading: 'LOADING',
      options: {
        event: 'set-config',
        payload: {
          mysql_options: { ...mysql },
          pg_options: { ...pg },
          rds_mysql_options: { ...rds_mysql },
          rds_pg_options: { ...rds_pg },
          sqlite_options: { ...sqlite },
        },
        callback: handleClose,
      },
    });
  };

  // Function to handle onChange -- when tab panels change
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    // On panel change reset all passwords to hidden
    setShowpass({
      mysql: false,
      pg: false,
      rds_mysql: false,
      rds_pg: false,
      sqlite: false,
    });
    // Change which tab panel is hidden/shown
    setValue(newValue);
  };

  // Array of all db names for login tabs
  const dbNames = ['MySql', 'Postgres', 'RDS Mysql', 'RDS Postgres', 'Sqlite'];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          variant="fullWidth"
          value={value}
          onChange={handleChange}
          aria-label="wrapped label basic tabs"
          className="db-login-tabs"
        >
          {dbNames.map((db, idx) => (
            <Tab
              label={db}
              wrapped
              {...a11yProps(idx)}
              className="db-login-tab"
              key={db}
            />
          ))}
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        {inputFieldsToRender.mysql}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {inputFieldsToRender.pg}
      </TabPanel>
      <TabPanel value={value} index={2}>
        {inputFieldsToRender.rds_mysql}
      </TabPanel>
      <TabPanel value={value} index={3}>
        {inputFieldsToRender.rds_pg}
      </TabPanel>
      <TabPanel value={value} index={4}>
        {inputFieldsToRender.sqlite}
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
}
interface ConfigViewProps {
  show: boolean;
  onClose: () => void;
}

function ConfigView({ show, onClose }: ConfigViewProps) {
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
}

export default ConfigView;
