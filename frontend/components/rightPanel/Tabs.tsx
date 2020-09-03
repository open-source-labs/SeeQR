import React, { Component } from "react";
import PropTypes from "prop-types";
import { Tab } from "./tabsChildren/Tab";
import { SchemaContainer } from "./SchemaContainer";

type TabsProps = {
  activeTab: string,
  tabList: string[],
  queries: any,
  onClickTabItem: any,
}

export class Tabs extends Component<TabsProps> {

  constructor(props: TabsProps) {
    super(props);
  }

  render() {
    const {
      onClickTabItem,
      tabList,
      activeTab,
      queries,
    } = this.props;

    console.log("queries before ", queries);
    const activeTabQueries = queries.filter((query) => query.querySchema === activeTab);
    console.log('activeTabQueries', activeTabQueries);
    console.log('tabList', tabList);


    return (
      <div className="tabs">
        <ol className="tab-list">
          {tabList.map((tab, index) => {

            return (
              <Tab
                activeTab={activeTab}
                key={index}
                label={tab}
                onClickTabItem={onClickTabItem}
              />
            );
          })}
        </ol>
        <div className="tab-content">
          {tabList.map((tab) => {
            if (tab !== activeTab) return undefined;
            return <SchemaContainer queries={activeTabQueries} currentSchema={activeTab} />;
          })}
        </div>
      </div>
    );
  }
}
