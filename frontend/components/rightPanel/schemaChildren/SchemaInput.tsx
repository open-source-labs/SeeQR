import React, { Component } from 'react';
import GenerateData from './GenerateData';

const { ipcRenderer } = window.require('electron');

// Codemirror configuration
import 'codemirror/lib/codemirror.css'; // Styline
import 'codemirror/mode/sql/sql'; // Language (Syntax Highlighting)
import 'codemirror/theme/lesser-dark.css'; // Theme
import CodeMirror from 'react-codemirror';

type SchemaInputProps = {
  onClose: any;
  schemaName: string;
};

type state = {
  schemaString: string;
};

class SchemaInput extends Component<SchemaInputProps, state> {
  constructor(props: SchemaInputProps) {
    super(props);
    this.handleSchemaSubmit = this.handleSchemaSubmit.bind(this);
    this.handleSchemaChange = this.handleSchemaChange.bind(this);
  }

  state: state = {
    schemaString: '',
  };

  // Updates state.schemaString as user inputs query string
  handleSchemaChange(event: string) {
    this.setState({
      schemaString: event,
    });
  }

  handleSchemaSubmit(event: any) {
    event.preventDefault();

    const schemaObj = {
      schemaName: this.props.schemaName,
      schemaFilePath: '',
      schemaString: this.state.schemaString,
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
              onChange={(e) => this.handleSchemaChange(e)}
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
