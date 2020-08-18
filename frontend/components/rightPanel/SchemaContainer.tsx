import React, { Component, MouseEvent } from 'react';
import { Data } from './schemaChildren/Data';
import { Results } from './schemaChildren/Results';
import Query from './schemaChildren/Query';

const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type SchemaContainerProps = {

}

export class SchemaContainer extends Component<SchemaContainerProps> {
  constructor(props: SchemaContainerProps) {
    super(props);
  }
  // state: QueryState = {
  //   queries: [],
  // };
  render() {
    return (
      <div>
        <h3>SchemaContainer Panel</h3>
        <Data />
        <Query />
        <Results />
      </div>
    );
  }
}
