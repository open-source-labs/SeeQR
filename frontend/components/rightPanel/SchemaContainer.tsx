import React, { Component, MouseEvent } from 'react';
import { Data } from './schemaChildren/Data';
import { Results } from './schemaChildren/Results';
import Query from './schemaChildren/Query';
const { ipcRenderer } = window.require('electron');
const { dialog } = require('electron').remote;
import SchemaModal from './schemaChildren/SchemaModal';

type SchemaContainerProps = {
  // queries: {
  //   queryString: string;
  //   queryData: object[];
  //   queryStatistics: any;
  //   querySchema: string;
  // }[];
  queries: any;
  currentSchema: string;
};

type state = {
  currentSchema: string;
  show: boolean;
};

export class SchemaContainer extends Component<SchemaContainerProps> {
  constructor(props: SchemaContainerProps) {
    super(props);
    this.showModal = this.showModal.bind(this);
  }

  state: state = {
    currentSchema: '',
    show: false,
  };

  showModal = (event: any) => {
    this.setState({ show: !this.state.show });
  };

  render() {
    return (
        <div id="main-right">
        
          <div id="schema-tabs">{/* <div>Schema Tabs Here</div> */}</div>

          <div id="test-panels">
            <div id="schema-left">
              <Query currentSchema={this.props.currentSchema} />
              <Data queries={this.props.queries} />
            </div>
            <div id="schema-right">
              <Results queries={this.props.queries} />
            </div>
          </div>
        </div>
    );
  }
}
