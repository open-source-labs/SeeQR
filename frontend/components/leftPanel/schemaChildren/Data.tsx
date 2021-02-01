import React, { Component } from 'react';
import Table from './dataChildren/DataTable';

type DataProps = {
  queries: {
    queryString: string;
    queryData: {}[];
    queryStatistics: any;
    querySchema: string;
    queryLabel: string;
  }[];
};

export default class Data extends Component<DataProps> {
  constructor(props) {
    super(props);
  }

  // Rendering results of tracked query from Query panel.
  render() {
    const { queries } = this.props;

    return (
      <div id="data-panel">
        <h3 id="results-title">Data Table</h3>
        <div id="data-table">{queries.length === 0 ? null : <Table queries={queries} />}</div>
      </div>
    );
  }
}
