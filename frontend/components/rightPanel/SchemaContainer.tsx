import React, { Component } from 'react';
import { Data } from './schemaChildren/Data';
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
    return (
      <div id="main-right">
        <div id="test-panels">
          <div id="schema-left">
            <div>
              <Query
                currentSchema={this.props.currentSchema}
                tableList={this.props.tableList}
              />
            </div>
            <div>
              <Data queries={this.props.queries} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
