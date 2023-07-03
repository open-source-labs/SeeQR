import React from 'react';
import ParanoidUniverse from './EricBloom/bloom2';
// import { AppState } from '../../../types';

const NewChart = ({ show, selectedDb, dbTables, dbType }) => {
  if (!show) return null;
  return (
    <div>
      <ParanoidUniverse 
      selectedDb={selectedDb}
      dbTables={dbTables}
      dbType={dbType}
      />
    </div>
  );
};

export default NewChart;
