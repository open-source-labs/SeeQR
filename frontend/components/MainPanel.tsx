import React, { Component } from 'react';
import { Compare } from './leftPanel/Compare';
import History from './leftPanel/History';
import { SchemaContainer } from './rightPanel/SchemaContainer';
const { ipcRenderer } = window.require('electron');
type MainState = {
  // queries: {
  //   queryString: string;
  //   queryData: string;
  //   queryStatistics: any
  //   querySchema: string;
  // }[];
  queries: any;
  currentSchema: string;
  // queryLabel: string;
  dbLists: any;
};
type MainProps = {};
// interface MainState {
//   queries: any;
//   currentSchema: string;
// }
class MainPanel extends Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
  }
  state: MainState = {
    queries: [],
    // currentSchema will change depending on which Schema Tab user selects
    currentSchema: 'schemaB',
    dbLists: {}
  };

  componentDidMount() {
    // Listening for returnedData from executing Query
    // Update state with new object (containing query data, query statistics, query schema
    // inside of state.queries array
    ipcRenderer.on('return-execute-query', (event: any, returnedData: any) => {
      console.log('returnedData', returnedData);
      // destructure from returnedData from backend
      const { queryString, queryData, queryStatistics, queryCurrentSchema, queryLabel } = returnedData;
      // create new query object with returnedData
      const newQuery = {
        queryString,
        queryData,
        queryStatistics,
        querySchema: queryCurrentSchema,
        queryLabel,
      }
      // create copy of current queries array
      let queries = this.state.queries.slice();
      // push new query object into copy of queries array
      queries.push(newQuery)
      this.setState({ queries })
      console.log('state after receiving data: ', this.state);
    });
    ipcRenderer.on('db-lists', (event: any, returnedLists: any) => {
      this.setState({dbLists: returnedLists})
      console.log("In MainPanel, lists:", returnedLists)
    })

  }

  render() {

    return (
      <div id="main-panel">
        <div id="main-left">
          <History queries={this.state.queries} currentSchema={this.state.currentSchema} />
          <Compare />
        </div>
        <SchemaContainer queries={this.state.queries} currentSchema={this.state.currentSchema} />
      </div>
    );
  }
}
export default MainPanel;
