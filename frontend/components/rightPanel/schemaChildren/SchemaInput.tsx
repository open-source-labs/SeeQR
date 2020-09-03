import React, { Component, MouseEvent, ChangeEvent } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
const { ipcRenderer } = window.require('electron');
import GenerateData from './GenerateData';

type ClickEvent = React.MouseEvent<HTMLElement>;

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
    this.handleSchemaEntry = this.handleSchemaEntry.bind(this);
  }
  state: state = {
    
    schemaEntry: '',
  };
  handleSchemaEntry(event: any) {
    this.setState({ schemaEntry: event.target.value });
    console.log('schema entry: ', this.state.schemaEntry);
    //console.log('schema entry type: ', typeof this.state.schemaEntry);
  }
  handleSchemaSubmit(event: any) {
    event.preventDefault();

    const schemaObj = {
      schemaName: this.props.schemaName,
      schemaFilePath: '',
      schemaEntry: this.state.schemaEntry,
    };
    ipcRenderer.send('input-schema', schemaObj);
    console.log(`sending ${schemaObj} to main process`);
  }
  onClose = (event: any) => {
    this.props.onClose && this.props.onClose(event);
  };

  render() {
    console.log('state', this.state);
    return (
      <div className="input-schema">
        <form onSubmit={this.handleSchemaSubmit}>
          {/* <p>Schema label: {this.props.schemaName}</p> */}
          <br />
          <input
            className="schema-text-field"
            type="text"
            placeholder="Input Schema Here..."
            onChange={(e) => this.handleSchemaEntry(e)}
          />
          <button>submit</button>
        </form>
      </div>
    );
  }
}

export default SchemaInput;
