import React, { Component } from 'react';
import { Data } from './schemaChildren/Data';
import { Results } from './schemaChildren/Results';
import Query from './schemaChildren/Query';

type SchemaContainerProps = {
  queries: any;
  currentSchema: string;
  tableList: string[];
};

type state = {
  currentSchema: string;
};

export class SchemaContainer extends Component<SchemaContainerProps> {
  constructor(props: SchemaContainerProps) {
    super(props);
  }

  state: state = {
    currentSchema: '',
  };

  render() {

    console.log('Schema Container: ', this.props.tableList);

    return (
      <div id="main-right">
        <div id="test-panels">
          <div id="schema-left">
            <Query currentSchema={this.props.currentSchema} tableList={this.props.tableList} />
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
