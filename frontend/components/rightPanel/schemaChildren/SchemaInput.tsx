import React, { Component } from 'react';
import GenerateData from './GenerateData';

const { ipcRenderer } = window.require('electron');

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

type SchemaInputProps = {
  onClose: any;
  schemaName: string;
};

type state = {
  schemaEntry: string;
};

class SchemaInput extends Component<SchemaInputProps, state> {
  constructor(props: SchemaInputProps) {
    super(props);
    this.handleSchemaSubmit = this.handleSchemaSubmit.bind(this);
    this.updateCode = this.updateCode.bind(this);
  }
  state: state = {
    schemaEntry: '',
  };

  // Updates state.queryString as user inputs query string
  updateCode(event: string) {
    this.setState({
      schemaEntry: event,
    });
  }

  handleSchemaSubmit(event: any) {
    event.preventDefault();

    const schemaObj = {
      schemaName: this.props.schemaName,
      schemaFilePath: '',
      schemaEntry: this.state.schemaEntry,
    };
    ipcRenderer.send('input-schema', schemaObj);
  }

  onClose = (event: any) => {
    this.props.onClose && this.props.onClose(event);
  };

  render() {
    // Codemirror module configuration options
    var options = {
      lineNumbers: true,
      mode: 'sql',
      theme: 'lesser-dark',
    };

    return (
      <div className="input-schema">
        <form onSubmit={this.handleSchemaSubmit}>
          <br />
          <div className="codemirror">
            <CodeMirror
              onChange={(e) => this.updateCode(e)}
              options={options}
            />
          </div>
          <button>submit</button>
        </form>
      </div>
    );
  }
}

export default SchemaInput;
