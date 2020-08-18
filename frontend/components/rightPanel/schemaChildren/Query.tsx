import React, { Component, MouseEvent } from 'react';
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type QueryProps = {};

class Query extends Component<QueryProps> {
  constructor(props: QueryProps) {
    super(props);
  }
  // state: QueryState = {
  //   queries: [],
  // };
  render() {
    return (
      <div id="query-window">
        <h3 style={{border: '1px solid blue'}}>Query Panel</h3>
        <input className="text-field" type="text" placeholder="insert query here..." value="" />
        <input type="submit" value="previous queries" />
        <input type="submit" value="submit query" />
      </div>
    );
  }
}

export default Query;
