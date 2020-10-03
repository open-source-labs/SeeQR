import React, { Component } from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

const { dialog } = require('electron').remote;
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type DummyDataModalProps = {
    show: boolean;
    showModal: any;
    onClose: any;
};

type state = {
  currentSchema: string,
  currentTable: string,
  tableNames: string[],
  dataInfo: object
}

class DummyDataModal extends Component<DummyDataModalProps, state> {

  constructor(props: DummyDataModalProps) {
    super(props);
    this.dropDownList = this.dropDownList.bind(this);
    this.selectHandler = this.selectHandler.bind(this);
  }
  //hard coded in for testing purposes
  state: state = {
    currentSchema: 'testSchema',
    currentTable: 'select table',
    tableNames: ['customers', 'locations', 'suppliers'],
    dataInfo: {}
  }

  selectHandler = (eventKey, e: React.SyntheticEvent<unknown>) => {
    this.setState({currentTable: eventKey });
  };

  dropDownList = () => {
    return this.state.tableNames.map((tableName, index) => <Dropdown.Item key={index} className="queryItem" eventKey={tableName}>{tableName}</Dropdown.Item>)
  };

  render() {

    if (this.props.show === false) {
      return null;
    }

    return (
      <div className="dummy-data-modal">
        <h3>Generate Dummy Data</h3>
        <p>Select table and number of rows:</p>
          <div className="dummy-data-select">
            <Dropdown onSelect={this.selectHandler}>
              <Dropdown.Toggle>
                {this.state.currentTable}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {this.dropDownList()};
              </Dropdown.Menu>
            </Dropdown>
            <input id="dummy-rows-input" type="text" placeholder="number of rows...">
            </input>
            <button id="dummy-rows-button">
              add to table
            </button>
          </div>
      </div>
    )
  }
}

export default DummyDataModal;