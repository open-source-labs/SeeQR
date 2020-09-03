import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tab } from './tabsChildren/Tab';
import { SchemaContainer } from './SchemaContainer';
import SchemaModal from './schemaChildren/SchemaModal';

type TabsProps = {
  currentSchema: string,
  tabList: string[],
  queries: any,
  onClickTabItem: any,
}

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
    const {
      onClickTabItem,
      tabList,
      currentSchema,
      queries,
    } = this.props;

    const activeTabQueries = queries.filter((query) => query.querySchema === currentSchema);

    console.log('QUERIES IN TABS COMPONENT (AFTER FILTER)', queries);

    return (
      <div className="tabs" id="main-right">
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
          {tabList.map((tab, index) => {
            if (tab !== currentSchema) return undefined;
            return <SchemaContainer key={index} queries={activeTabQueries} currentSchema={currentSchema} />;
          })}
        </div>
      </div>
    );
  }
}



      // <div className="tabs" id="main-right">
      //   <ol className="tab-list">
      //     {tabList.map((tab, index) => {
      //       return (
      //         <Tab
      //           currentSchema={currentSchema}
      //           key={index}
      //           label={tab}
      //           onClickTabItem={onClickTabItem}
      //         />
      //       );
      //     })}
      //   </ol>
      //     <button
      //       className="input-schema-button"
      //       onClick={(e) => {
      //         this.showModal(e);
      //       }}
      //     >
      //       +
      //     </button>
      //     <SchemaModal show={this.state.show} onClose={this.showModal} />
      //   <div className="tab-content">
      //     {tabList.map((tab, index) => {
      //       if (tab !== currentSchema) return undefined;
      //       return <SchemaContainer key={index} queries={activeTabQueries} currentSchema={currentSchema} />;
      //     })}
      //   </div>
      // </div>


  // state: state = {
  //   show: false,
  // };
  // showModal = (event: any) => {
  //   this.setState({ show: !this.state.show });
  // };