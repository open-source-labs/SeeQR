import React, { Component } from 'react';
const { ipcRenderer } = window.require('electron');

// onClose property responds to onClose function
type GenerateDataProps = {
  onClose: any;
};

type state = {
};

class GenerateData extends Component<GenerateDataProps, state> {
  constructor(props: GenerateDataProps) {
    super(props);
    // bind form submission function
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }
  state: state = {
  };

  handleFormSubmit(event: any) {
    event.preventDefault();
    // pass down any state from the form
    const formObj = {
    };
    // on submit button click, sends form obj to backend
    ipcRenderer.send('form-input', formObj);
  }
  // close modal function
  onClose = (event: any) => {
    this.props.onClose && this.props.onClose(event);
  };
  // input all form input fields under "form" and link to event handlers to save to state
  // bind all functions for field entries on the form
  render() {
    return (
      <div>
        <form onSubmit={this.handleFormSubmit}>
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

export default GenerateData;
