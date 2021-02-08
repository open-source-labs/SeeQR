import React from 'react';
import {
  MuiThemeProvider,
  Select,
  MenuItem,
  InputLabel,
} from '@material-ui/core/';
import { MuiTheme } from '../../../style-variables';

interface QueryDbProps {
  db: string;
  onChange: (newDb: string) => void;
  databases: string[];
}

const QueryDb = ({ db, onChange, databases }: QueryDbProps) => (
  <MuiThemeProvider theme={MuiTheme}>
    <InputLabel id="queryView-db-label">Database</InputLabel>
    <Select
      value={db}
      onChange={(evt) => onChange(evt.target.value as string)}
      labelId="queryView-db-label"
    >
      {databases.map((dbName) => (
        <MenuItem value={dbName} key={`queryview_dbselect_${dbName}`}>
          {dbName}
        </MenuItem>
      ))}
    </Select>
  </MuiThemeProvider>
);

export default QueryDb;
