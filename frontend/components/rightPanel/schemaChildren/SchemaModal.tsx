import React, { Component } from 'react';
import { Dropdown, ButtonToolbar } from 'react-bootstrap';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import SchemaInput from './SchemaInput';
import DropdownToggle from 'react-bootstrap/esm/DropdownToggle';
import DropdownMenu from 'react-bootstrap/esm/DropdownMenu';
// import GenerateData from './GenerateData';

const { dialog } = require('electron').remote;
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type SchemaModalProps = {
  tabList: {
    id: number;
    name: string;
  }[];
  show: boolean;
  showModal: any;
  onClose: any;
};

type state = {
  schemaName: string;
  schemaFilePath: string;
  schemaEntry: string;
  redirect: boolean;
  selectedId: number;
  instance: any;
  copy: boolean
};

class SchemaModal extends Component<SchemaModalProps, state> {
  constructor(props: SchemaModalProps) {
    super(props);
    this.handleSchemaSubmit = this.handleSchemaSubmit.bind(this);
    this.handleSchemaFilePath = this.handleSchemaFilePath.bind(this);
    this.handleSchemaEntry = this.handleSchemaEntry.bind(this);
    this.handleSchemaName = this.handleSchemaName.bind(this);
    this.handleInstanceName = this.handleInstanceName.bind(this);
    this.handleCopyData = this.handleCopyData.bind(this);
    this.dropDownList = this.dropDownList.bind(this);

    // this.handleQueryPrevious = this.handleQueryPrevious.bind(this);
    // this.handleQuerySubmit = this.handleQuerySubmit.bind(this);
  }

  state: state = {
    schemaName: '',
    schemaFilePath: '',
    schemaEntry: '',
    redirect: false,
    selectedId: 0,
    instance: '',
    copy: false
  };


  // Set schema name
  handleSchemaName(event: any) {
    // convert input label name to lowercase only with no spacing to comply with db naming convention.
    const schemaNameInput = event.target.value;
    let dbSafeName = schemaNameInput.toLowerCase();
    dbSafeName = dbSafeName.replace(/[^A-Z0-9]/gi, '');
    this.setState({ schemaName: dbSafeName });
  }

  // Load schema file path
  // When file path is uploaded, query entry is cleared.
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
        console.log('Error in handleSchemaFilePath method of SchemaModal.tsx.', err);
      });
  }

  // When schema script is inserted, file path is cleared set dialog to warn user.
  handleSchemaEntry(event: any) {
    this.setState({ schemaEntry: event.target.value, schemaFilePath: '' });
    // this.setState({ schemaFilePath: '' });
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

  handleInstanceName() {
    this.setState({ instance: event?.target });
  }

  handleCopyData(event: any) {
    console.log(this.state.copy);
    if(!this.state.copy) this.setState({ copy: true });
    else this.setState({ copy: false });
  }

  dropDownList = () => {
    console.log('in dropdown function');
    return this.props.tabList.map((db) => <Dropdown.Item key={db.id} className="queryItem" >{db.name}</Dropdown.Item>);
  };

  render() {
    if (this.props.show === false) {
      return null;
    }

    console.log(this.props.tabList);

    let selectedDB: any = this.props.tabList.find(db => db.id === this.state.selectedId)

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
            {/* <Link to="/SchemaInput">
              <button className="input-button">Input Schema</button>
            </Link> */}
          </div>
          <h3>Copy Existing Instance</h3>
          <div>
          <p>Schema Name (auto-formatted): {this.state.schemaName}</p>
          <input
            className="schema-label"
            type="text"
            placeholder="Input schema label..."
            onChange={(e) => this.handleSchemaName(e)}
          />
          <p>Select Instance</p>
          <Dropdown onSelect={this.handleInstanceName}>
            <Dropdown.Toggle>
              {this.state.instance}
            </Dropdown.Toggle> 
              <Dropdown.Menu>
                {this.dropDownList()}
              </Dropdown.Menu>
          </Dropdown>
              <input type="checkbox" name="Data" onClick={this.handleCopyData}/> With Data
            <button className="modal-buttons" onClick={this.handleSchemaFilePath}>Make Copy</button>
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
          </Switch>
        </Router>
      </div>
    );
  }
}

export default SchemaModal;

{/* <DropdownButton id="add-query-button" title="Select Instance &#9207;">
            {this.dropDownList()}
          </DropdownButton> */}
