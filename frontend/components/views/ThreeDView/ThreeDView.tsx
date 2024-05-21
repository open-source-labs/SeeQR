import React from 'react';
import ThreeDUniverse from './ThreeDUniverse';
import { DBType, AppState, TableInfo } from '../../../../shared/types/types';

interface ThreeDModelProps {
  show: boolean;
  selectedDb: AppState['selectedDb'];
  dbTables: TableInfo[];
  dbType: DBType | undefined;
}

function ThreeDView({ show, selectedDb, dbTables, dbType }: ThreeDModelProps) {
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
