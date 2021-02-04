import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

const { dialog } = require('electron').remote;

const { ipcRenderer } = window.require('electron');

type DummyDataPanelProps = {
  currentSchema: string;
  tableList: string[];
};

type state = {
  currentTable: string;
  dataInfo: {};
  rowNumber: string;
};

class DummyDataPanel extends Component<DummyDataPanelProps, state> {
  constructor(props: DummyDataPanelProps) {
    super(props);
    this.dropDownList = this.dropDownList.bind(this);
    this.selectHandler = this.selectHandler.bind(this);
    this.addToTable = this.addToTable.bind(this);
    this.changeRowNumber = this.changeRowNumber.bind(this);
    this.deleteRow = this.deleteRow.bind(this);
    this.submitDummyData = this.submitDummyData.bind(this);

    this.state = {
      currentTable: 'select table',
      dataInfo: {},
      rowNumber: '',
    };
  }

  selectHandler = (eventKey) => {
    if (eventKey !== 'none') {
      this.setState({ currentTable: eventKey });
    }
  };

  // function to generate the dropdown optiosn from the table names in state
  dropDownList = () => {
    const { tableList } = this.props;
    const result: any = [];
    let tableName;
    // Checks to make sure tables are available to generate dummy data to.
    // Allows user to choose a specific table, or to write dummy data to all tables.
    if (tableList.length > 0) {
      for (let i = 0; i <= tableList.length; i += 1) {
        if (tableList[i]) tableName = tableList[i];
        else tableName = 'all';
        result.push(
          <Dropdown.Item key={i} className="queryItem" eventKey={tableName}>
            {tableName}
          </Dropdown.Item>
        );
      }
    } else {
      // Adds message in dropdown list to show that not tables are available
      // Went this route because we couldn't get the dropdown to disappear if there were no tables in tableList
      result.push(
        <Dropdown.Item key="key" className="queryItem" eventKey="none">
          No tables available!
        </Dropdown.Item>
      );
    }
    return result;
  };

  // submit listener to add table name and rows to the dataInfo object in state
  addToTable = (event: any) => {
    event.preventDefault();
    const { rowNumber, currentTable } = this.state;
    // if no number is entered
    if (!rowNumber) {
      dialog.showErrorBox('Please enter a number of rows.', '');
    }
    if (currentTable === 'select table') {
      dialog.showErrorBox('Please select a table.', '');
    }
    // reset input fields and update nested object in state
    else {
      const table = currentTable;
      const number = Number(rowNumber);
      if (table !== 'all') {
        this.setState((prevState) => ({
          ...prevState,
          currentTable: 'select table',
          rowNumber: '',
          dataInfo: {
            ...prevState.dataInfo,
            [table]: number,
          },
        }));
      } else {
        const dataInfo = {};
        const { tableList } = this.props;
        tableList.forEach((currTable) => {
          if (currTable !== 'all') {
            dataInfo[currTable] = number;
          }
        });
        this.setState((prevState) => ({
          ...prevState,
          currentTable: 'select table',
          rowNumber: '',
          dataInfo,
        }));
      }
    }
  };

  // onclick listener to delete row from table
  deleteRow = (event: any) => {
    const name = event.target.id;
    this.setState((prevState) => ({
      ...prevState,
      dataInfo: {
        ...prevState.dataInfo,
        [name]: undefined,
      },
    }));
  };

  // onchange listener to update the rowNumber string in state
  changeRowNumber = (event: any) => {
    this.setState({ rowNumber: event.target.value });
  };

  createRow = () => {
    // once state updates on click, render the table row from the object
    const newRows: JSX.Element[] = [];
    const { dataInfo } = this.state;

    Object.keys(dataInfo).forEach((key) => {
      if (dataInfo[key]) {
        newRows.push(
          <tr className="dummy-table-row" key={key}>
            <td>{key}</td>
            <td>{dataInfo[key]}</td>
            <td>
              <button type="button" id={key} onClick={this.deleteRow}>
                x
              </button>
            </td>
          </tr>
        );
      }
    });

    return newRows;
  };

  submitDummyData = () => {
    const { currentSchema } = this.props;
    const { dataInfo } = this.state;
    // check if there are requested dummy data values
    if (Object.keys(dataInfo).length) {
      // creates a dummyDataRequest object with schema name and table name/rows
      const dummyDataRequest = {
        schemaName: currentSchema,
        dummyData: dataInfo,
      };
      ipcRenderer.send('generate-dummy-data', dummyDataRequest);
      // reset state to clear the dummy data panel's table
      this.setState({ dataInfo: {} });
    } else dialog.showErrorBox('Please add table and row numbers', '');
  };

  render() {
    const { currentTable, rowNumber } = this.state;
    return (
      <div className="dummy-data-panel">
        <h3>Generate Dummy Data</h3>
        <p>Select table and number of rows:</p>
        <div className="dummy-data-select">
          <Dropdown onSelect={this.selectHandler}>
            <Dropdown.Toggle>{currentTable}</Dropdown.Toggle>
            <Dropdown.Menu className="DD-Dropdown">
              {this.dropDownList()}
            </Dropdown.Menu>
          </Dropdown>
          <input
            id="dummy-rows-input"
            type="text"
            placeholder="number of rows..."
            value={rowNumber}
            onChange={this.changeRowNumber}
          />
          <button
            id="dummy-rows-button"
            type="button"
            onClick={this.addToTable}
          >
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
          <button type="button" onClick={this.submitDummyData}>
            Generate Dummy Data
          </button>
        </div>
      </div>
    );
  }
}

export default DummyDataPanel;
