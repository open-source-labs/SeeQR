import React, { Component, MouseEvent } from 'react';
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type QueryProps = {

}

class Query extends Component<QueryProps> {
  constructor(props: QueryProps) {
    super(props);
  }
  // state: QueryState = {
  //   queries: [],
  // };
  render() {
    return (
      <div>
        <h3>Query Panel</h3>
      </div>
    );
  }
}

export default Query;