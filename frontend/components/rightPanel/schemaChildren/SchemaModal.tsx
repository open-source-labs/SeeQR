import React, { Component, MouseEvent, ChangeEvent } from 'react';
import { Redirect, BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
const { dialog } = require('electron').remote;
const fs = require('fs');
const { ipcRenderer } = window.require('electron');
import SchemaInput from './SchemaInput';
import GenerateData from './GenerateData';

type ClickEvent = React.MouseEvent<HTMLElement>;

type SchemaModalProps = {
  show: boolean;
  showModal: any;
  onClose: any;
};

type state = {
  schemaName: string;
  schemaFilePath: string;
  schemaEntry: string;
  redirect: boolean;
};

class SchemaModal extends Component<SchemaModalProps, state> {
  constructor(props: SchemaModalProps) {
    super(props);
    this.handleSchemaSubmit = this.handleSchemaSubmit.bind(this);
    this.handleSchemaFilePath = this.handleSchemaFilePath.bind(this);
    this.handleSchemaEntry = this.handleSchemaEntry.bind(this);
    this.handleSchemaName = this.handleSchemaName.bind(this);

    // this.handleQueryPrevious = this.handleQueryPrevious.bind(this);
    // this.handleQuerySubmit = this.handleQuerySubmit.bind(this);
  }

  state: state = {
    schemaName: '',
    schemaFilePath: '',
    schemaEntry: '',
    redirect: false,
  };


  // Set schema name
  handleSchemaName(event: any) {
    // convert input label name to lowercase only with no spacing for db naming convention
    const schemaNameInput = event.target.value;
    let dbSafeName = schemaNameInput.toLowerCase();
    dbSafeName = dbSafeName.replace(/[^A-Z0-9]/gi, '');
    this.setState({ schemaName: dbSafeName });
  }

  // Load schema file path
  // When file path is uploaded, query entry is cleared (change to replaced by script later)
  // Add dialog box to warn user of this
  handleSchemaFilePath(event: ClickEvent) {
    event.preventDefault();
    dialog
      .showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Custom File Type', extensions: ['tar', 'sql'] }],
        message: 'Please upload .sql or .tar database file',
      })
      .then((result: object) => {
        const filePath = result['filePaths'];
        this.setState({ schemaFilePath: filePath });
        const schemaObj = {
          schemaName: this.state.schemaName,
          schemaFilePath: this.state.schemaFilePath,
          schemaEntry: '',
        };
        ipcRenderer.send('input-schema', schemaObj);
        this.props.showModal(event);
      })
      .catch((err: object) => {
        console.log(err);
      });
  }

  // when schema script is inserted, file path is cleared
  // set dialog to warn user
  handleSchemaEntry(event: any) {
    this.setState({ schemaEntry: event.target.value });
    this.setState({ schemaFilePath: '' });
  }

  handleSchemaSubmit(event: any) {
    event.preventDefault();

    const schemaObj = {
      schemaName: this.state.schemaName,
      schemaFilePath: this.state.schemaFilePath,
      schemaEntry: this.state.schemaEntry,
    };
    ipcRenderer.send('input-schema', schemaObj);
  }

  render() {
    if (this.props.show === false) {
      return null;
    }

    return (
      <div className="modal" id="modal">
        <Router>
          <h3>Load or input schema</h3>
          <p>Schema Name (auto-formatted): {this.state.schemaName}</p>
          <input
            className="schema-label"
            type="text"
            placeholder="Input schema label..."
            onChange={(e) => this.handleSchemaName(e)}
          />
          <div className="modal-buttons">
            <button onClick={this.handleSchemaFilePath}>Load Schema</button>
            <Link to="/SchemaInput">
              <button className="input-button">Input Schema</button>
            </Link>
          </div>

          <button className="close-button" onClick={this.props.onClose}>
            X
          </button>

          <Switch>
            <Route exact path="/" component={SchemaModal} />
            <Route
              exact
              path="/SchemaInput"
              render={(props: any) => <SchemaInput {...props} schemaName={this.state.schemaName} />}
            />
            <Route exact path="/GenerateData" component={GenerateData} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default SchemaModal;
