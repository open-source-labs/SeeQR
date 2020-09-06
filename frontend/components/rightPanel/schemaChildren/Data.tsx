import React, { Component } from 'react';
import { Table } from './dataChildren/DataTable';

type DataProps = {
  queries: {
    queryString: string;
    queryData: {}[];
    queryStatistics: any
    querySchema: string;
    queryLabel: string;
  }[];
};

export class Data extends Component<DataProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { queries } = this.props;

    return (
      <div id="data-panel">
        <br />
        <br />
        <br />
        <br />
        <h3 id="results-title">Data Table</h3>
        <div id="data-table">
          {queries.length === 0 ? null : <Table queries={queries} />}
        </div>

      </div>
    );
  }
}