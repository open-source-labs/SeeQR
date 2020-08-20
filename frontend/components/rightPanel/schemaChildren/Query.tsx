import React, { Component, MouseEvent, ChangeEvent } from 'react';
const { ipcRenderer } = window.require('electron');
import SchemaModal from './SchemaModal';

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

type ClickEvent = React.MouseEvent<HTMLElement>;
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

type QueryProps = { currentSchema: string };

type state = {
  queryString: string;
  currentSchema: string;
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
    currentSchema: '',
    show: false,
  };

  handleQueryEntry(event: any) {
    this.setState({ queryString: event.target.value, currentSchema: event.target.name });
  }

  handleQuerySubmit(event: any) {
    event.preventDefault();
    const queryAndSchema = {
      queryString: this.state.queryString,
      queryCurrentSchema: this.state.currentSchema,
    };
    ipcRenderer.send('execute-query', queryAndSchema);
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
      // mode: 'javascript',
      mode: 'sql',
      // mode: 'markdown',
      // theme: 'monokai',
      // theme: 'midnight',
      theme: 'lesser-dark',
      // theme: 'solarized dark',
    };

    return (
      <div id="query-window">
        <h3 style={{ border: '1px solid blue' }}>Query Panel</h3>
        {/* <button
          onClick={(e) => {
            this.showModal(e);
          }}
        >
          Edit Schema
        </button>
        <SchemaModal show={this.state.show} onClose={this.showModal} /> */}
        <form onSubmit={this.handleQuerySubmit}>
          {/* <input
            className="text-field"
            type="text"
            name={this.props.currentSchema}
            placeholder="insert query here..."
            onChange={(e) => this.handleQueryEntry(e)}
          /> */}
          {/* <input type="select" onClick={this.handleQueryPrevious}/> */}
          <CodeMirror value={this.state.queryString} onChange={this.updateCode} options={options} />
          <button onSubmit={this.handleQuerySubmit}>Submit</button>
        </form>
      </div>
    );
  }
}

export default Query;
