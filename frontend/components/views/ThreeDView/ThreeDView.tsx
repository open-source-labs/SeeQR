import React from 'react';
import ThreeDUniverse from './ThreeDUniverse';
import { AppState, TableInfo } from '../../../types';
import { DBType } from '../../../../backend/BE_types';

interface ThreeDModelProps {
  show: boolean;
  selectedDb: AppState['selectedDb'];
  dbTables: TableInfo[];
  dbType: DBType | undefined;
}

function ThreeDView({
  show, selectedDb, dbTables, dbType,
}: ThreeDModelProps) {
  if (!show) return null;
  return (
    <ThreeDUniverse
      selectedDb={selectedDb}
      dbTables={dbTables}
      dbType={dbType}
    />
  );
}

export default ThreeDView;
