import React, { Component, MouseEvent } from 'react';
import { Data } from './schemaChildren/Data';
import { Results } from './schemaChildren/Results';
import Query from './schemaChildren/Query';

type SchemaContainerProps = {
  queries: {
    queryString: string;
    queryData: object[];
    queryStatistics: any
    querySchema: string;
  }[];
  currentSchema: string;
};

export class SchemaContainer extends Component<SchemaContainerProps> {
  constructor(props: SchemaContainerProps) {
    super(props);
  }

  render() {
    return (
      <div id="main-right">
        <div id="schema-tabs">
          <h3 style={{ border: '1px solid blue' }}>SchemaContainer Panel</h3>
          <div>Schema Tabs Here</div>
        </div>

        <div id="results-panel">
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
