import React, { useState } from 'react';
import { Button } from '@mui/material';
import styled from 'styled-components';
import { AppState, DatabaseInfo, TableInfo } from '../../../types';
import { DBType } from '../../../../backend/BE_types';
import TablesTabs from './TablesTabBar';
import DatabaseDetails from './DatabaseDetails';
import DummyDataModal from '../../modal/DummyDataModal';
import { sidebarShowButtonSize } from '../../../style-variables';

interface DbViewProps {
  selectedDb: AppState['selectedDb'];
  show: boolean;
  setERView: (boolean: boolean) => void;
  ERView: boolean;
  curDBType: DBType | undefined;
  DBInfo: DatabaseInfo[] | undefined;
  dbTables: TableInfo[];
  selectedTable: TableInfo | undefined;
  setSelectedTable: (tableInfo: TableInfo | undefined) => void;
}

const StyledDummyButton = styled(Button)`
  position: fixed;
  top: 260px;
  right: ${sidebarShowButtonSize};
`;

function DbView({
  selectedDb,
  show,
  setERView,
  ERView,
  curDBType,
  DBInfo,
  dbTables,
  selectedTable,
  setSelectedTable,
}: DbViewProps) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // if the program can't find the database, it will return null. else it will return the selected db.
  const db = DBInfo?.find((dbi) => dbi.db_name === selectedDb);

  if (!show) return null;
  return (
    <>
      <DatabaseDetails db={db} />
      <br />
      <TablesTabs
        tables={dbTables}
        selectTable={(table: TableInfo) => setSelectedTable(table)}
        selectedTable={selectedTable}
        selectedDb={selectedDb}
        setERView={setERView}
        curDBType={curDBType}
      />
      <br />
      <br />
      {selectedTable && !ERView ? (
        <StyledDummyButton
          variant="contained"
          color="primary"
          onClick={handleClickOpen}
        >
          Generate Dummy Data
        </StyledDummyButton>
      ) : null}
      <DummyDataModal
        open={open}
        onClose={handleClose}
        dbName={db?.db_name}
        tableName={selectedTable?.table_name}
        curDBType={curDBType}
      />
    </>
  );
}

export default DbView;
