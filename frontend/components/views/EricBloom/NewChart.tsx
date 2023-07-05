import React from 'react';
import ParanoidUniverse from './bloom2';
import { AppState, TableInfo } from '../../../types';
import { DBType } from '../../../../backend/BE_types';

interface ThreeDModelProps {
  show: boolean;
  selectedDb: AppState['selectedDb'];
  dbTables: TableInfo[];
  dbType: DBType | undefined;
};

const NewChart = ({ show, selectedDb, dbTables, dbType }: ThreeDModelProps) => {
  if (!show) return null;
  return (
    <>
      <ParanoidUniverse 
        selectedDb={selectedDb}
        dbTables={dbTables}
        dbType={dbType}
      />
    </>
  );
};

export default NewChart;
