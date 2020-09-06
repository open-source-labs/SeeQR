import React, { Component } from 'react';
import { Compare } from './leftPanel/Compare';
import History from './leftPanel/History';
import { Tabs } from './rightPanel/Tabs';

const { ipcRenderer } = window.require('electron');

type MainState = {
  queries: {
    queryString: string;
    queryData: {}[];
    queryStatistics: any
    querySchema: string;
    queryLabel: string;
  }[];
  // queries: any;
  currentSchema: string;
  lists: any;
};

type MainProps = {};
class MainPanel extends Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
    this.onClickTabItem = this.onClickTabItem.bind(this);
  }
  state: MainState = {
    queries: [],
    // currentSchema will change depending on which Schema Tab user selects
    currentSchema: 'defaultDB',
    lists: {
      databaseList: ['defaultDB'],
      tableList: [],
    }
  };

  componentDidMount() {
    ipcRenderer.send('return-db-list');

    // Listening for returnedData from executing Query
    // Update state with new object (containing query data, query statistics, query schema
    // inside of state.queries array
    ipcRenderer.on('return-execute-query', (event: any, returnedData: any) => {
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
    });

    ipcRenderer.on('db-lists', (event: any, returnedLists: any) => {
      this.setState({ lists: returnedLists })
      this.onClickTabItem(this.state.lists.databaseList[this.state.lists.databaseList.length - 1])
    })
  }

  onClickTabItem(tabName) {
    ipcRenderer.send('change-db', tabName);
    ipcRenderer.on('return-change-db', (event: any, db_name: string) => {
      this.setState({ currentSchema: tabName });
    });
  }

  render() {
    return (
      <div id="main-panel">
        <div id="main-left">
          <History queries={this.state.queries} currentSchema={this.state.currentSchema} />
          <Compare queries={this.state.queries} currentSchema={this.state.currentSchema} />
        </div>
        <Tabs currentSchema={this.state.currentSchema} tabList={this.state.lists.databaseList} queries={this.state.queries} onClickTabItem={this.onClickTabItem} />
      </div>
    );
  }
}

export default MainPanel;
