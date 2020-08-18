import React, { Component, MouseEvent } from 'react';
const { ipcRenderer } = window.require('electron');
import { Compare } from './leftPanel/Compare';
import { History } from './leftPanel/History';
import { Data } from './rightPanel/schemaChildren/Data';
import { Results } from './rightPanel/schemaChildren/Results';
import { SchemaContainer } from './rightPanel/SchemaContainer';
import Query from './rightPanel/schemaChildren/Query';

type ClickEvent = React.MouseEvent<HTMLElement>;

type MainState = {
  queries: object[];
};

type MainProps = {};

class MainPanel extends Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
  }
  state: MainState = {
    queries: [],
  };
  render() {
    return (
      <div>
        <h3>This is the main panel!</h3>
        <History />
        <Compare />
        <SchemaContainer />
      </div>
    );
  }
}

export default MainPanel;
