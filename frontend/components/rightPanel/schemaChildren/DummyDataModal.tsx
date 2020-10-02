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
    schemaTables: string[];
};

type state = {
  currentSchema: string,
  dataInfo: object
}

class DummyDataModal extends Component<DummyDataModalProps, state> {

  constructor(props: DummyDataModalProps) {
    super(props);
  }
  state: state = {
    currentSchema: '',
    dataInfo : {}
  }

  dropDownList = () => {
    //returns list of table names from schema
      //untested code:
      return this.props.schemaTables.map((tableName, index) => <Dropdown.Item></Dropdown.Item>)
  };

  render() {

    if (this.props.show === false) {
      return null;
    }

    return (
      <div className="dummy-data-modal">
        <h3>Generate Dummy Data</h3>
        <p>select table</p>

      </div>
    )
  }
}

export default DummyDataModal;