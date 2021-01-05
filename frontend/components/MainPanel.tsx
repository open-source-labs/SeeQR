import React, { useState } from 'react';
import { Compare } from './leftPanel/Compare';
import History from './leftPanel/History';
import { Tabs } from './rightPanel/Tabs';
import LoadingModal from './LoadingModal';

// type MainState = {
//   queries: {
//     queryString: string;
//     queryData: {}[];
//     queryStatistics: any;
//     querySchema: string;
//     queryLabel: string;
//   }[];
//   currentSchema: string;
//   lists: any;
//   loading: boolean;
//   dbSize: string;
// };

function MainPanel() {
  const [queries, setQueries] = useState([]);
  const [dbSize, setDBSize] = useState('');

  async function submitQuery(event, query: String) {
    event.preventDefault();
    const response = await fetch('/query/execute-query-tracked', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryString: query }),
    });
    const returnedData = await response.json();
    console.log(returnedData.queryData);
    console.log(returnedData.queryStats);
    // const {
    //   queryStats,
    //   queryData
    // } = returnedData;
    // const { queries } = state;
    // const obj = {...state, queries: [...queries, returnedData]};

    // setState(obj)
  }

  // componentDidMount() {
  // ipcRenderer.send('return-db-list');

  // Listening for returnedData from executing Query
  // Update state with new object (containing query data, query statistics, query schema
  // inside of state.queries array
  // ipcRenderer.on('return-execute-query', (event: any, returnedData: any) => {
  //   // destructure from returnedData from backend
  //   const {
  //     queryString,
  //     queryData,
  //     queryStatistics,
  //     queryCurrentSchema,
  //     queryLabel,
  //   } = returnedData;
  //   // create new query object with returnedData
  //   const newQuery = {
  //     queryString,
  //     queryData,
  //     queryStatistics,
  //     querySchema: queryCurrentSchema,
  //     queryLabel,
  //   };
  //   // create copy of current queries array
  //   let queries = this.state.queries.slice();
  //   // push new query object into copy of queries array
  //   queries.push(newQuery);
  //   this.setState({ queries });
  // });

  // ipcRenderer.on(
  //   'db-lists',
  //   (event: any, returnedLists: any, returnedDbSize: string) => {
  //     this.setState((prevState) => ({
  //       ...prevState,
  //       lists: {
  //         databaseList: returnedLists.databaseList,
  //         tableList: returnedLists.tableList,
  //       },
  //       dbSize: returnedDbSize,
  //     }));
  //   }
  // );

  // ipcRenderer.on('switch-to-new', (event: any) => {
  //   const newSchemaIndex = this.state.lists.databaseList.length - 1;
  //   this.setState({
  //     currentSchema: this.state.lists.databaseList[newSchemaIndex],
  //   });
  // });

  // Renders the loading modal during async functions.
  // ipcRenderer.on('async-started', (event: any) => {
  //   this.setState({ loading: true }); // ** James/Katie - changing to false for now to avoid loading modal until we can figure out later why the async complete listener isnt kicking in
  // });

  // ipcRenderer.on('async-complete', (event: any) => {
  //   this.setState({ loading: false });
  // });
  // }

  // onClickTabItem(tabName) {
  //   ipcRenderer.send('change-db', tabName);
  //   ipcRenderer.send('return-db-list', tabName);
  //   this.setState({ currentSchema: tabName });
  // }

  return (
    <div id="main-panel">
      <div id="main-left">
        <History queries={queries} />
        <Compare queries={queries} />
      </div>
      <Tabs submit={submitQuery} queries={queries} databaseSize={dbSize} />
    </div>
  );
}

export default MainPanel;
