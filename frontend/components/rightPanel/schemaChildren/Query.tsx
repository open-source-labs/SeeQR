import React, { Component, MouseEvent, ChangeEvent } from 'react';
const { ipcRenderer } = window.require('electron');

require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');

// Codemirror Themes
require('codemirror/mode/markdown/markdown');
require('codemirror/theme/monokai.css');
require('codemirror/theme/midnight.css');
require('codemirror/theme/lesser-dark.css');
require('codemirror/theme/solarized.css');

// Codemirror Component
var CodeMirror = require('react-codemirror');

/************************************************************
 *********************** TYPESCRIPT: TYPES ***********************
 ************************************************************/

type ClickEvent = React.MouseEvent<HTMLElement>; // assign type ClickEvent to handleQuerySubmit & debug
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

type QueryProps = { currentSchema: string };

type state = {
  queryString: string;
  currentSchema: string;
  queryLabel: string;
  show: boolean;
};

class Query extends Component<QueryProps, state> {
  constructor(props: QueryProps) {
    super(props);
    this.handleQuerySubmit = this.handleQuerySubmit.bind(this);
    this.handleQueryEntry = this.handleQueryEntry.bind(this);
    // this.showModal = this.showModal.bind(this);
    // this.handleQueryPrevious = this.handleQueryPrevious.bind(this);
    this.updateCode = this.updateCode.bind(this);
  }

  state: state = {
    queryString: '',
    queryLabel: '',
    currentSchema: '',
    show: false,
  };

  handleQueryEntry(event: InputChangeEvent) {
    this.setState({ queryString: event.target.value, currentSchema: event.target.name });
  }
  handleLabelEntry(event: any) {
    this.setState({ queryLabel: event.target.value });
  }

  handleQuerySubmit(event: any) {
    event.preventDefault();
    const queryAndSchema = {
      queryString: this.state.queryString,
      queryCurrentSchema: this.state.currentSchema,
      queryLabel: this.state.queryLabel,
    };
    ipcRenderer.send('execute-query', queryAndSchema);
    this.setState({ queryString: '' });
  }

  // showModal = (event: any) => {
  //   this.setState({ show: !this.state.show });
  // };

  updateCode(newQueryString: string) {
    this.setState({
      queryString: newQueryString,
    });
  }

  render() {
    var options = {
      lineNumbers: true,
      mode: 'sql',
      theme: 'lesser-dark',
    };

    return (
      <div id="query-panel">
        <h3>Query</h3>
        {/* <button
          onClick={(e) => {
            this.showModal(e);
          }}
        >
          Edit Schema
        </button> */}
        {/* <SchemaModal show={this.state.show} onClose={this.showModal} /> */}
        <form onSubmit={this.handleQuerySubmit}>
          <label>Query Label: </label>
          <input
            className="label-field"
            type="text"
            placeholder="enter label for query"
            onChange={(e) => this.handleLabelEntry(e)}
          />
          <br />
          <br />
          <label>Query:</label>
          <br />
          {/* <input type="select" onClick={this.handleQueryPrevious}/> */}
          <CodeMirror value={this.state.queryString} onChange={this.updateCode} options={options} />
          <button>Submit</button>
        </form>
      </div>
    );

  }
}

export default Query;
