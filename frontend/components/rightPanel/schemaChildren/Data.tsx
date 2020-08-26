import React, { Component } from 'react';

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
  constructor(props: DataProps) {
    super(props);
  }

  render() {
    const { queries } = this.props;
    let { queryData } = queries[0];
    // Take off quotation marks
    queryData = queryData.slice(1, queryData.length - 1);

    return (
      <div id="data-panel">
        <h3 id="results-title">Data Table</h3>
        <div id="data-table">
          <div className="query-data">{queryData}</div>
        </div>
      </div>
    );
  }
}
