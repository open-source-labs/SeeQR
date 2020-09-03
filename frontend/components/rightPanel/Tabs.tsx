import React, { Component } from "react";
import PropTypes from "prop-types";
import { Tab } from "./tabsChildren/Tab";
import { SchemaContainer } from "./SchemaContainer";

type TabsProps = {
  currentSchema: string,
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
      currentSchema,
      queries,
    } = this.props;

    console.log("queries before ", queries);
    const activeTabQueries = queries.filter((query) => query.querySchema === currentSchema);
    console.log('activeTabQueries', activeTabQueries);
    console.log('tabList', tabList);


    return (
      <div className="tabs">
        <ol className="tab-list">
          {tabList.map((tab, index) => {
            return (
              <Tab
                currentSchema={currentSchema}
                key={index}
                label={tab}
                onClickTabItem={onClickTabItem}
              />
            );
          })}
        </ol>
        <div className="tab-content">
          {tabList.map((tab) => {
            if (tab !== currentSchema) return undefined;
            return <SchemaContainer queries={activeTabQueries} currentSchema={currentSchema} />;
          })}
        </div>
      </div>
    );
  }
}
