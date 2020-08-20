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
    queryData = queryData.slice(1, queryData.length - 1)

    return (
      <div style={{ border: '1px solid purple', fontSize: '12px' }}>
        <h2 id='results-title'>Data Table</h2>
        <div>{queryData}</div>
      </div >
    );
  }
}


