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
  dataInfo: {},
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
    dataInfo: {customers: 200, locations: 20}
  }

  selectHandler = (eventKey, e: React.SyntheticEvent<unknown>) => {
    this.setState({currentTable: eventKey});
  };

  dropDownList = () => {
    return this.state.tableNames.map((tableName, index) => <Dropdown.Item key={index} className="queryItem" eventKey={tableName}>{tableName}</Dropdown.Item>)
  };

  createRow = () => {
    //once state updates on click, render the table row from the object
    const newRows: JSX.Element[] = [];
      for (let key in this.state.dataInfo) {
        newRows.push(
          <tr>
            <td>{key}</td>
            <td>{this.state.dataInfo[key]}</td>
            <td><button>x</button></td>
          </tr>
        )
      }
    return newRows;
  }

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
          <div className="dummy-data-table-container">
            <table className="dummy-data-table">
              <tbody>
                <tr className="top-row">
                  <th>table</th>
                  <th># of rows</th>
                  <th>delete</th>
                </tr>
                {this.createRow()}
              </tbody>
            </table>
          </div>
      </div>
    )
  }
}

export default DummyDataModal;