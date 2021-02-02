import { dialog } from 'electron';
import React, { Component } from 'react';
import { Compare } from './rightPanel/Compare';
import History from './rightPanel/History';
import Tabs from './leftPanel/Tabs';
import LoadingModal from './LoadingModal';

const { ipcRenderer } = window.require('electron');

type MainState = {
  queries: {
    queryString: string;
    queryData: {}[];
    queryStatistics: any;
    querySchema: string;
    queryLabel: string;
  }[];
  currentSchema: string;
  lists: any;
  loading: boolean;
  dbSize: string;
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
    },
    loading: false,
    dbSize: '',
  };

  componentDidMount() {
    ipcRenderer.send('return-db-list');

    // Listening for returnedData from executing Query
    // Update state with new object (containing query data, query statistics, query schema
    // inside of state.queries array
    ipcRenderer.on('return-execute-query', (event: any, returnedData: any) => {
      // destructure from returnedData from backend
      const {
        queryString,
        queryData,
        queryStatistics,
        queryCurrentSchema,
        queryLabel,
      } = returnedData;
      // create new query object with returnedData
      const newQuery = {
        queryString,
        queryData,
        queryStatistics,
        querySchema: queryCurrentSchema,
        queryLabel,
      };
      // create copy of current queries array
      let queries = this.state.queries.slice();
      // push new query object into copy of queries array
      queries.push(newQuery);
      this.setState({ queries });
    });

    ipcRenderer.on(
      'db-lists',
      (event: any, returnedLists: any, returnedDbSize: string) => {
        this.setState((prevState) => ({
          ...prevState,
          lists: {
            databaseList: returnedLists.databaseList,
            tableList: returnedLists.tableList,
          },
          dbSize: returnedDbSize,
        }));
      }
    );

    ipcRenderer.on('switch-to-new', (event: any) => {
      const newSchemaIndex = this.state.lists.databaseList.length - 1;
      this.setState({
        currentSchema: this.state.lists.databaseList[newSchemaIndex],
      });
    });

    // Renders the loading modal during async functions.
    ipcRenderer.on('async-started', (event: any) => {
      this.setState({ loading: false }); // ** James/Katie - changing to false for now to avoid loading modal until we can figure out later why the async complete listener isnt kicking in
    });

    ipcRenderer.on('async-complete', (event: any) => {
      this.setState({ loading: false });
    });
  }

  onClickTabItem(tabName) {
    ipcRenderer.send('change-db', tabName);
    ipcRenderer.send('return-db-list', tabName);
    this.setState({ currentSchema: tabName });
  }

  render() {

    const {currentSchema, lists, queries,  dbSize, loading} = this.state

    return (
      <div id="main-panel">
        <div>
          <LoadingModal show={loading} />
        </div>
        <div id="main-left">
          <Tabs
            currentSchema={currentSchema}
            tabList={lists.databaseList}
            queries={queries}
            onClickTabItem={this.onClickTabItem}
            tableList={lists.tableList}
            databaseSize={dbSize}
          />
        </div>
        <div id="main-right">
          <History
            queries={this.state.queries}
            currentSchema={this.state.currentSchema}
          />
          <Compare
            queries={this.state.queries}
            currentSchema={this.state.currentSchema}
          />
        </div>
      </div>
    );
  }
}

export default MainPanel;
