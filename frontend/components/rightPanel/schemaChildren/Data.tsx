import React, { Component } from 'react';

import { Table } from './dataChildren/DataTable';

type DataProps = {
  // queries: {
  //   queryString: string;
  //   queryData: string;
  //   queryStatistics: any
  //   querySchema: string;
  // }[];
  queries: any;
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
          <div className="query-data">insert data here</div>
          {queries.length === 0 ? null : <Table queries={queries} />}
        </div>

      </div>
    );
  }
}


  // // if queries array is not empty, then display dynamic data table
  // if (this.props.queries.length !== 0) {
  //   this.renderDataTable();
  // }

  //  // destructure queries array
  //  const { queries } = this.props;

  //  const { queryData } = queries[queries.length - 1];
  //  console.log('queryData', queryData);

  //  // create dynamic table based off queries array

//  return (
//   <div id="data-panel">
//     <br />
//     <br />
//     <h3 id="results-title">Data Table</h3>
//     <div id="data-table">
//       <div className="query-data">insert data here</div>
//       <table>

