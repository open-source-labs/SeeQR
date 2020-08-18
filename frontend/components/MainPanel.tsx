import React, { Component, MouseEvent } from 'react';
const { ipcRenderer } = window.require('electron');
import { Compare } from './leftPanel/Compare';
import { History } from './leftPanel/History';
import { SchemaContainer } from './rightPanel/SchemaContainer';

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
      <div id="main-panel">
        <h3 style={{ border: '1px solid blue' }}>This is the main panel!</h3>
        <div id="main-left">
          <History />
          <Compare />
        </div>
        <div id="main-right">
          <SchemaContainer />
        </div>
      </div>
    );
  }
}

export default MainPanel;
