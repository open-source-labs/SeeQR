import React, { Component } from 'react';

type TableProps = {
  queries: {
    queryString: string;
    queryData: {}[];
    queryStatistics: any
    querySchema: string;
    queryLabel: string;
  }[];
};
export class Table extends Component<TableProps> {

  constructor(props) {
    super(props);
    this.getKeys = this.getKeys.bind(this);
    this.getHeader = this.getHeader.bind(this);
    this.getRowsData = this.getRowsData.bind(this);
  }

  // Returns list of headings that should be displayed @ top of table
  getKeys() {
    const { queries } = this.props;

    // All keys will be consistent across each object in queryData,
    // so we only need to list keys of first object in data returned
    // from backend.
    return Object.keys(queries[queries.length - 1].queryData[0]);
  }

  // Create Header by generating a <th> element for each key.
  getHeader() {
    var keys = this.getKeys();
    return keys.map((key, index) => {
      return <th key={key}>{key.toUpperCase()}</th>
    })
  }

  // Iterate through queryData array to return the body part of the table.
  getRowsData() {
    const { queries } = this.props;

    var items = queries[queries.length - 1].queryData;
    var keys = this.getKeys(); // actor_id, firstName, lastName, lastUpdated
    console.log('keys', keys);

    return items.map((row, index) => {
      console.log('data', row);
      return <tr key={index}><RenderRow key={index} data={row} keys={keys} /></tr>
    })
  }

  render() {

    return (
      <div>
        <table>
          <thead>
            <tr>{this.getHeader()}</tr>
          </thead>
          <tbody>
            {this.getRowsData()}
          </tbody>
        </table>
      </div>

    );
  }
}

type RenderRowProps = {
  data: any;
  keys: any;
  key: any;
};

// Returns each cell within table
const RenderRow = (props: RenderRowProps) => {
  const { data, keys } = props;
  return keys.map((header, index) => {
    // if the value of a row is undefined, then go to next iteration
    if (data[header] == undefined) return;
    // turn all values in data object to string or number
    data[header] = data[header].toString();
    return <td key={index}>{data[header]}</td>
  })
}