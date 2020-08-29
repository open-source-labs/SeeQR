import React, { Component, MouseEvent, ChangeEvent } from 'react';
const { ipcRenderer } = window.require('electron');
const { dialog } = require('electron').remote;
import SchemaModal from './SchemaModal';

// Codemirror Styling
require('codemirror/lib/codemirror.css');

// Codemirror Languages
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
    // this.handleQueryEntry = this.handleQueryEntry.bind(this);
    this.showModal = this.showModal.bind(this);
    // this.handleQueryPrevious = this.handleQueryPrevious.bind(this);
    this.updateCode = this.updateCode.bind(this);
  }

  state: state = {
    queryString: '',
    queryLabel: '',
    currentSchema: 'Schema A',
    show: false,
  };

  // Updates state.queryString as user inputs query string
  // handleQueryEntry(event: InputChangeEvent) {
  //   this.setState({ queryString: event.target.value, currentSchema: event.target.name });
  // }

  // Updates state.queryString as user inputs query label
  handleLabelEntry(event: any) {
    this.setState({ queryLabel: event.target.value });
  }

  // Updates state.queryString as user inputs query string
  updateCode(newQueryString: string) {
    this.setState({
      queryString: newQueryString,
    });
  }

  // Submits query to backend on 'execute-query' channel
  handleQuerySubmit(event: any) {
    event.preventDefault();
    // if input fields for query label or query string are empty, then
    // send alert to input both fields
    if (!this.state.queryLabel || !this.state.queryString) {
      // alert('Please enter a Label and a Query.')
      const noInputAlert = dialog.showErrorBox('Please enter a Label and a Query.', '');
      console.log(noInputAlert);
    } else {
      const queryAndSchema = {
        queryString: this.state.queryString,
        queryCurrentSchema: this.state.currentSchema,
        queryLabel: this.state.queryLabel,
      };
      ipcRenderer.send('execute-query', queryAndSchema);
      // this.setState({ queryString: '' });
    }
  }

  showModal = (event: any) => {
    this.setState({ show: !this.state.show });
  };

  render() {
    // Codemirror module configuration options
    var options = {
      lineNumbers: true,
      mode: 'sql',
      theme: 'lesser-dark',
    };

    return (
      <div id="query-panel">
        <h3>Query</h3>
        <button
          onClick={(e) => {
            this.showModal(e);
          }}
        >
          Edit Schema
        </button>
        <SchemaModal show={this.state.show} onClose={this.showModal} />
        <form onSubmit={this.handleQuerySubmit}>
          <label>Query Label:* </label>
          <input
            className="label-field"
            type="text"
            placeholder="enter label for query"
            onChange={(e) => this.handleLabelEntry(e)}
          />
          <br />
          <br />
          <label>Query:*</label>
          {/* <input type="select" onClick={this.handleQueryPrevious}/> */}
          <div id="codemirror">
            <CodeMirror
              value={this.state.queryString}
              onChange={this.updateCode}
              options={options}
            />
          </div>
          <button>Submit</button>
          <br />
          <br />
          <p>*required</p>
        </form>
      </div>
    );
  }
}

export default Query;
