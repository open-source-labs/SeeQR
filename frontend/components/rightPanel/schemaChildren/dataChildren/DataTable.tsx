import React, { Component } from 'react';

type TableProps = {
  // queries: {
  //   queryString: string;
  //   queryData: string;
  //   queryStatistics: any
  //   querySchema: string;
  // }[];
  queries: any;
};

export class Table extends Component<TableProps> {

  constructor(props) {
    super(props);
    this.getKeys = this.getKeys.bind(this);
    this.getHeader = this.getHeader.bind(this);
    this.getRowsData = this.getRowsData.bind(this);
  }

  getKeys() {
    const { queries } = this.props;
    // console.log('query json object', JSON.stringify({ queries }));

    // store queries as a JSON string
    // const queryDataJSON = JSON.stringify(queries[queries.length - 1].queryData)
    // console.log('queryDataJSON', queryDataJSON[0]);

    // return Object.keys(queryDataJSON[0]);

    // const queryDataJSON = JSON.stringify({ queries })
    return Object.keys(queries[queries.length - 1].queryData[0]);
  }

  // this works
  getHeader() {
    var keys = this.getKeys();
    return keys.map((key, index) => {
      return <th key={key}>{key.toUpperCase()}</th>
    })
  }

  getRowsData() {
    const { queries } = this.props;

    var items = queries[queries.length - 1].queryData;
    var keys = this.getKeys();
    return items.map((row, index) => {
      return <tr key={index}><RenderRow key={index} data={row} keys={keys} /></tr>
    })
  }

  render() {

    return (
      <div>
        {/* {this.getKeys()} */}
        <table>
          <thead>
            <tr>{this.getHeader()}</tr>
          </thead>
          <tbody>
            {/* {this.getRowsData()} */}
          </tbody>
        </table>
      </div>

    );
  }
}

type RenderRowProps = {
  // queries: {
  //   queryString: string;
  //   queryData: string;
  //   queryStatistics: any
  //   querySchema: string;
  // }[];
  // queries: any;
  data: any;
  keys: any;
  key: any;
};

const RenderRow = (props: RenderRowProps) => {
  return props.keys.map((key, index) => {
    return <td key={props.data[key]}>{props.data[key]}</td>
  })
}