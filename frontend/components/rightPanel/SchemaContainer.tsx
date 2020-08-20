import React, { Component, MouseEvent } from 'react';
import { Data } from './schemaChildren/Data';
import { Results } from './schemaChildren/Results';
import Query from './schemaChildren/Query';

const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type SchemaContainerProps = {currentSchema: string};

export class SchemaContainer extends Component<SchemaContainerProps> {
  constructor(props: SchemaContainerProps) {
    super(props);
  }
  // state: QueryState = {
  //   queries: [],
  // };
  render() {
    return (
      <div id="main-right">
        <div id="schema-tabs">
          <h3 style={{ border: '1px solid blue' }}>SchemaContainer Panel</h3>
          <div>Schema Tabs Here</div>
        </div>

        <div id="results-panel">
          <div id="schema-left">
            <Query currentSchema={this.props.currentSchema}/>
            <Data />
          </div>
          <div id="schema-right">
            <Results />
          </div>
        </div>
      </div>
    );
  }
}
