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
    this.handleSelect = this.handleSelect.bind(this);
  }
  //hard coded in for testing purposes
  state: state = {
    currentSchema: 'testSchema',
    currentTable: 'select table',
    tableNames: ['customers', 'locations', 'suppliers'],
    dataInfo: {}
  }

  //not working properly
  handleSelect = (event) => {
    console.log(event)
  }

  dropDownList = () => {
    return this.state.tableNames.map((tableName, index) => <Dropdown.Item key={index} className="queryItem" value={tableName}>{tableName}</Dropdown.Item>)
  };

  render() {

    if (this.props.show === false) {
      return null;
    }

    return (
      <div className="dummy-data-modal">
        <h3>Generate Dummy Data</h3>
        <p>select table</p>
        <Dropdown onSelect={this.handleSelect}>
          <Dropdown.Toggle>
            {this.state.currentTable}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {this.dropDownList()};
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }
}

export default DummyDataModal;