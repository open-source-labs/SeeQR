import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tab } from './tabsChildren/Tab';
import { SchemaContainer } from './SchemaContainer';
import SchemaModal from './schemaChildren/SchemaModal';

type TabsProps = {
  activeTab: string;
  tabList: string[];
  queries: any;
  onClickTabItem: any;
};

type state = {
  show: boolean;
};
export class Tabs extends Component<TabsProps> {
  constructor(props: TabsProps) {
    super(props);
    this.showModal = this.showModal.bind(this);
  }

  state: state = {
    show: false,
  };
  showModal = (event: any) => {
    this.setState({ show: !this.state.show });
  };

  render() {
    const { onClickTabItem, tabList, activeTab, queries } = this.props;

    const activeTabQueries = queries.filter((query) => query.querySchema === activeTab);

    console.log('tabList', tabList);

    return (
      <div className="tabs">
        <ol className="tab-list">
          {tabList.map((tab, index) => {
            return (
              <Tab activeTab={activeTab} key={index} label={tab} onClickTabItem={onClickTabItem} />
            );
          })}
        </ol>
        <div id="main-right">
          <button
            className="input-schema-button"
            onClick={(e) => {
              this.showModal(e);
            }}
          >
            +
          </button>
          <SchemaModal show={this.state.show} onClose={this.showModal} />
          <div className="tab-content">
            {tabList.map((tab) => {
              if (tab !== activeTab) return undefined;
              return <SchemaContainer queries={activeTabQueries} currentSchema={activeTab} />;
            })}
          </div>
        </div>
      </div>
    );
  }
}
