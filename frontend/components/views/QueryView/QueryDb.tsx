import React, { useState, useEffect } from 'react';
import {
  MuiThemeProvider,
  Select,
  MenuItem,
  InputLabel,
} from '@material-ui/core/';
import { IpcMainEvent } from 'electron';
import { MuiTheme } from '../../../style-variables';
import { isDbLists } from '../../../types';
import { once } from '../../../lib/utils'

const { ipcRenderer } = window.require('electron');

// emitting with no payload requests backend to send back a db-lists event with list of dbs
const requestDbListOnce = once(() => ipcRenderer.send('return-db-list'));

interface QueryDbProps {
  db: string;
  onChange: (newDb: string) => void;
}

const QueryDb = ({ db, onChange }: QueryDbProps) => {
  const [databases, setDatabases] = useState<string[]>([]);

  useEffect(() => {
    const receiveDbs = (evt: IpcMainEvent, dbLists: unknown) => {
      if (isDbLists(dbLists)) {
        setDatabases(dbLists.databaseList);
      }
    };
    ipcRenderer.on('db-lists', receiveDbs);
    requestDbListOnce()

    return () => ipcRenderer.removeListener('db-lists', receiveDbs);
  });

  return (
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
};
export default QueryDb;
