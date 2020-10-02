import React, { Component } from 'react';

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

  render() {
    if (this.props.show === false) {
      return null;
    }
    return (
      <div>

      </div>
    )
  }
}