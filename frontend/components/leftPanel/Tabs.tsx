import React, { Component } from 'react';
import SchemaContainer from './SchemaContainer';
import SchemaModal from './schemaChildren/SchemaModal';
import Tab from './tabsChildren/Tab';

const { ipcRenderer } = window.require('electron');

type Query = {
  queryString: string;
  queryData: {}[];
  queryStatistics: any;
  querySchema: string;
  queryLabel: string;
};

type TabsProps = {
  currentSchema: string;
  tabList: string[];
  queries: Query[];
  onClickTabItem: any;
  tableList: string[];
  databaseSize: string;
};

type TabsState = {
  show: boolean;
};
export default class Tabs extends Component<TabsProps, TabsState> {
  constructor(props: TabsProps) {
    super(props);
    this.showModal = this.showModal.bind(this);

    this.state = {
      show: false,
    };
  }

  componentDidMount() {
    // After schema is successfully sent to backend, backend spins up new database with inputted schemaName.
    // It will send the frontend an updated variable 'lists' that is an array of updated lists of all the tabs (which is the same
    // thing as all the databases). We open a channel to listen for it here inside of componentDidMount, then
    // we invoke onClose to close schemaModal ONLY after we are sure that backend has created that channel.
    ipcRenderer.on('db-lists', (event: any, returnedLists: any) => {
    // TODO: claudio commented this out. Make sure it's really not necessary
      // this.setState({
      //   // TODO: is the type of returnedLists correct?
      //   currentSchema: returnedLists,
      // });
      this.onClose();
    });
  }

  showModal = () => {
    this.setState({ show: true });
  };

  onClose = () => {
    this.setState({ show: false });
  };

  generateTabs() {
    const { tabList, currentSchema, onClickTabItem } = this.props;
    return tabList.map((tab) => (
      <Tab
        currentSchema={currentSchema}
        key={tab}
        label={tab}
        onClickTabItem={onClickTabItem}
      />
    ));
  }

  render() {
    const {
      tabList,
      tableList,
      currentSchema,
      queries,
      databaseSize,
    } = this.props;
    const { show } = this.state;

    const activeTabQueries = queries.filter(
      (query) => query.querySchema === currentSchema
    );

    return (
      // TODO: change id for equivalent class
      <div className="tabs" id="main-right">
        <ol className="tab-list">
          <span>{this.generateTabs()}</span>
          <span>
            <button
              id="input-schema-button"
              type="button"
              onClick={() => {
                this.showModal();
              }}
            >
              +
            </button>
          </span>
        </ol>
        <SchemaModal
          tabList={tabList}
          show={show}
          showModal={this.showModal}
          onClose={this.onClose}
        />
        <div className="tab-content">
          <SchemaContainer
            queries={activeTabQueries}
            currentSchema={currentSchema}
            tableList={tableList}
            databaseSize={databaseSize}
          />
        </div>
      </div>
    );
  }
}
