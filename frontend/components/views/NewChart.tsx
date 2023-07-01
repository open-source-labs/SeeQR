import React from 'react';
import ParanoidUniverse from './EricBloom/bloom2';
// import { AppState } from '../../../types';

const NewChart = ({ show, dbTables }) => {
  if (!show) return null;
  return (
    <div>
      <ParanoidUniverse 
      dbTables={dbTables}
      />
    </div>
  );
};

export default NewChart;
