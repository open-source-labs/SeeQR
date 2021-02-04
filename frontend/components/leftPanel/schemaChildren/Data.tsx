import React from 'react';
import Table from './dataChildren/DataTable';

type Query = {
  queryString: string;
  queryData: {}[];
  queryStatistics: any;
  querySchema: string;
  queryLabel: string;
};

type DataProps = {
  queries: Query[];
};

const Data = ({ queries } : DataProps) => (
  // Rendering results of tracked query from Query panel.
  <div id="data-panel">
    <h3 id="results-title">Data Table</h3>
    <div id="data-table">
      {queries.length === 0 ? null : <Table queries={queries} />}
    </div>
  </div>
);

export default Data;
