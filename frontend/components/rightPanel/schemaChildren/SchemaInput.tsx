import React, { Component, MouseEvent, ChangeEvent } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
const { ipcRenderer } = window.require('electron');
import GenerateData from './GenerateData';

type ClickEvent = React.MouseEvent<HTMLElement>;

type SchemaInputProps = {
  onClose: any;
};

type state = {
  schemaName: string;
  schemaEntry: string;
  schemaFilePath: '';
};

class SchemaInput extends Component<SchemaInputProps, state> {
  constructor(props: SchemaInputProps) {
    super(props);
    this.handleSchemaSubmit = this.handleSchemaSubmit.bind(this);
    this.handleSchemaEntry = this.handleSchemaEntry.bind(this);
  }
  state: state = {
    schemaName: '',
    schemaFilePath: '',
    schemaEntry: '',
  };
  handleSchemaEntry(event: any) {
    this.setState({ schemaEntry: event.target.value });
    this.setState({ schemaFilePath: '' });
    console.log('schema entry: ', this.state.schemaEntry);
    console.log('schema entry type: ', typeof this.state.schemaEntry);
  }
  handleSchemaSubmit(event: any) {
    event.preventDefault();

    const schemaObj = {
      schemaName: this.state.schemaName,
      schemaFilePath: this.state.schemaFilePath,
      schemaEntry: this.state.schemaEntry,
    };
    ipcRenderer.send('input-schema', schemaObj);
    console.log(`sending ${schemaObj} to main process`);
  }
  onClose = (event: any) => {
    this.props.onClose && this.props.onClose(event);
  };

  render() {
    return (
      <div>
        <form>
          <input
            className="schema-text-field"
            type="text"
            placeholder="Input Schema Here..."
            onChange={(e) => this.handleSchemaEntry(e)}
            />
          <div id="modal-buttons">
            <button>submit</button>
            <div className="actions">
              <button className="toggle-button" onClick={this.onClose}>
                close
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default SchemaInput;
