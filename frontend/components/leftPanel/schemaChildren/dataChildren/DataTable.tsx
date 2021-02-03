import React, { Component } from 'react';

type TableProps = {
  queries: {
    queryString: string;
    queryData: {}[];
    queryStatistics: any;
    querySchema: string;
    queryLabel: string;
  }[];
};
export default class Table extends Component<TableProps> {
  constructor(props) {
    super(props);
    this.getKeys = this.getKeys.bind(this);
    this.getHeader = this.getHeader.bind(this);
    this.getRowsData = this.getRowsData.bind(this);
  }

  // Returns list of headings that should be displayed @ top of table
  getKeys() {
    // TODO: order of keys could vary from different runs, which would change order of headers vs order of values
    const { queries } = this.props;

    // All keys will be consistent across each object in queryData,
    // so we only need to list keys of first object in data returned from backend.
    return Object.keys(queries[queries.length - 1].queryData[0]);
  }

  // Create Header by generating a <th> element for each key.
  getHeader() {
    const keys = this.getKeys();
    return keys.map((key) => <th key={key}>{key.toUpperCase()}</th>);
  }

  // Iterate through queryData array to return the body part of the table.
  getRowsData() {
    const { queries } = this.props;

    // gets last query object on array of labelled querie
    const items = queries[queries.length - 1].queryData;
    const keys = this.getKeys(); // actor_id, firstName, lastName, lastUpdated

    return items.map((row) => (
      <tr key={row.toString()}>
        <RenderRow data={row} keys={keys} />
        </tr>
    ));
  }

  render() {
    return (
      <div>
        <table>
          <thead id="dataTableHead">
            <tr>{this.getHeader()}</tr>
          </thead>
          <tbody id="dataTableBody">{this.getRowsData()}</tbody>
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
    if (data[header] === undefined || data[header] === null) return;
    // turn all values in data object to string or number
    data[header] = data[header].toString();
    return <td key={index}>{data[header]}</td>;
  });
};
