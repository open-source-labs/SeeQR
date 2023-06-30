import React from 'react';
import ForceDirectedGraph from './EricBloom/bloom';
import ParanoidUniverse from './EricBloom/bloom2';
import EricasoParanoidUniverse from './EricBloom/bloom3';
// import { AppState } from '../../../types';

const NewChart = ({ show, dbTables }) => {
  if (!show) return null;
  return (
    <div>
      {/* <ForceDirectedGraph
      dbTables={dbTables} 
      /> */}
      <ParanoidUniverse 
      dbTables={dbTables}
      />
      {/* <EricasoParanoidUniverse 
      dbTables = {dbTables}
      /> */}
    </div>
  );
};

export default NewChart;
