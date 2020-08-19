import React, { Component, MouseEvent, ChangeEvent } from 'react';
const { ipcRenderer } = window.require('electron');
import SchemaModal from './SchemaModal';

type ClickEvent = React.MouseEvent<HTMLElement>;
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

type QueryProps = {};

type state = {
  queryString: string;
  show: boolean;
};

class Query extends Component<QueryProps, state> {
  constructor(props: QueryProps) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleQueryEntry = this.handleQueryEntry.bind(this);
    // this.showModal = this.showModal.bind(this);
    // this.handleQueryPrevious = this.handleQueryPrevious.bind(this);
    // this.handleQuerySubmit = this.handleQuerySubmit.bind(this);
  }

  state: state = {
    queryString: '',
    show: false,
  };

  handleQueryEntry(event: any) {
    this.setState({ queryString: event.target.value });
  }

  handleSubmit(event: any) {
    event.preventDefault();
    console.log(this.state.queryString);
    ipcRenderer.send('execute-query', this.state.queryString);
  }

  showModal = (event: any) => {
    this.setState({ show: !this.state.show });
  };

  render() {
    console.log(this.state);
    return (
      <div id="query-window">
        <h3 style={{ border: '1px solid blue' }}>Query Panel</h3>
        <button
          onClick={(e) => {
            this.showModal(e);
          }}
        >
          Edit Schema
        </button>
        <SchemaModal show={this.state.show} onClose={this.showModal} />
        <form onSubmit={this.handleSubmit}>
          <input
            className="text-field"
            type="text"
            placeholder="insert query here..."
            onChange={(e) => this.handleQueryEntry(e)}
          />
          {/* <input type="select" onClick={this.handleQueryPrevious}/> */}
          <button>submit</button>
        </form>
      </div>
    );
  }
}

export default Query;
