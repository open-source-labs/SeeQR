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
    currentSchema: string;
    tableList: string[];
};

type state = {
  currentTable: string,
  dataInfo: {},
  rowNumber: string
}

class DummyDataModal extends Component<DummyDataModalProps, state> {

  constructor(props: DummyDataModalProps) {
    super(props);
    this.dropDownList = this.dropDownList.bind(this);
    this.selectHandler = this.selectHandler.bind(this);
    this.addToTable = this.addToTable.bind(this);
    this.changeRowNumber = this.changeRowNumber.bind(this);
    this.deleteRow = this.deleteRow.bind(this);
    this.submitDummyData = this.submitDummyData.bind(this);
  }
//state.lists.tableList
//state.currentSchema

  //hard coded in for testing purposes
  state: state = {
    // currentSchema: 'testSchema',
    currentTable: 'select table',
    // tableNames: ['customers', 'locations', 'suppliers', 'all'],
    dataInfo: {},
    rowNumber: ''
  }

  //handler to change the dropdown display to the selected table name
  selectHandler = (eventKey, e: React.SyntheticEvent<unknown>) => {
    this.setState({currentTable: eventKey});
  };

  //function to generate the dropdown optiosn from the table names in state
  dropDownList = () => {
    const result: any = [];
    let tableName;
    if (this.props.tableList.length > 0) {
      for (let i = 0; i <= this.props.tableList.length; i++) {
        if(this.props.tableList[i]) tableName = this.props.tableList[i];
        else tableName = 'all';
        result.push(<Dropdown.Item key={i} className="queryItem" eventKey={tableName}>{tableName}</Dropdown.Item>);
      }
    }
    return result;
  };

  //submit listener to add table name and rows to the dataInfo object in state
  addToTable = (event: any) => {
    event.preventDefault();
    //if no number is entered
    if (!this.state.rowNumber) {
      dialog.showErrorBox('Please enter a number of rows.', '');
    }
    if (this.state.currentTable === 'select table') {
      dialog.showErrorBox('Please select a table.', '');
    }
    //reset input fields and update nested object in state
    else {
      let table = this.state.currentTable;
      let number = Number(this.state.rowNumber);
        if (table !== 'all') {
          this.setState(prevState => ({
            ...prevState,
            currentTable: 'select table',
            rowNumber: '',
            dataInfo: {
              ...prevState.dataInfo,
              [table]: number
            }
          }))
        }
        else {
          const dataInfo = {};
          this.props.tableList.forEach(table => {
            if (table !== 'all') {
              dataInfo[table] = number;
            }
          })
          this.setState(prevState => ({
            ...prevState,
            currentTable: 'select table',
            rowNumber: '',
            dataInfo
          }))
        }
      }
  }

  //onclick listener to delete row from table
  deleteRow = (event: any) => {
    let name = event.target.id;
    this.setState(prevState => ({
      ...prevState,
      dataInfo: {
        ...prevState.dataInfo,
        [name]: undefined
      }
    }))
  }

  //onchange listener to update the rowNumber string in state
  changeRowNumber = (event: any) => {
    this.setState({ rowNumber: event.target.value })
  }

  createRow = () => {
    //once state updates on click, render the table row from the object
    const newRows: JSX.Element[] = [];
      for (let key in this.state.dataInfo) {
        if (this.state.dataInfo[key]) {
          newRows.push(
            <tr className="dummy-table-row" key={key}>
              <td>{key}</td>
              <td>{this.state.dataInfo[key]}</td>
              <td><button id={key} onClick={this.deleteRow}>x</button></td>
            </tr>
          )
        }
      }
    return newRows;
  }

  submitDummyData = (event: any) => {
    const dummyDataRequest = {
      //schemaName will eventually come from props, not state
      schemaName: this.props.currentSchema,
      dummyData: this.state.dataInfo
    }
    ipcRenderer.send('generate-dummy-data', dummyDataRequest);
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
              <Dropdown.Menu className="DD-Dropdown">
                {this.dropDownList()}
              </Dropdown.Menu>
            </Dropdown>
            <input id="dummy-rows-input" type="text" placeholder="number of rows..."
            value={this.state.rowNumber}
            onChange={this.changeRowNumber}>
            </input>
            <button id="dummy-rows-button"
                    onClick={this.addToTable}>
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
          <div id="generate-dummy-data">
            <button onClick={this.submitDummyData}>Generate Dummy Data</button>
          </div>
      </div>
    )
  }
}

export default DummyDataModal;