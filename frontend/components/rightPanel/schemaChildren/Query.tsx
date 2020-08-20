import React, { Component, MouseEvent, ChangeEvent } from 'react';
const { ipcRenderer } = window.require('electron');
import SchemaModal from './SchemaModal';

type ClickEvent = React.MouseEvent<HTMLElement>;
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

type QueryProps = { currentSchema: string };

type state = {
  queryString: string;
  currentSchema: string;
  labelString: string;
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
    labelString: '',
    currentSchema: '',
    show: false,
  };

  handleQueryEntry(event: any) {
    this.setState({ queryString: event.target.value, currentSchema: event.target.name });
  }
  handleLabelEntry(event: any) {
    this.setState({ labelString: event.target.value });
  }

  handleSubmit(event: any) {
    // event.preventDefault();
    console.log(this.state.queryString);
    const queryAndSchema = {
      queryString: this.state.queryString,
      queryCurrentSchema: this.state.currentSchema,
      labelString: this.state.labelString,
    };
    ipcRenderer.send('execute-query', queryAndSchema);
    this.setState({queryString : ''});
  }

  showModal = (event: any) => {
    this.setState({ show: !this.state.show });
  };

  render() {
    console.log(this.state);
    return (
      <div id="query-window">
        <h2 style={{ border: '1px solid blue' }}>Query</h2>
        {/* <button
          onClick={(e) => {
            this.showModal(e);
          }}
        >
          Edit Schema
        </button> */}
        <SchemaModal show={this.state.show} onClose={this.showModal} />
        <form onSubmit={this.handleSubmit}>
          <input
            className="label-field"
            type="text"
            placeholder="enter label for query"
            onChange={(e) => this.handleLabelEntry(e)}
          />
          <textarea
            className="text-field"
            name={this.props.currentSchema}
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
