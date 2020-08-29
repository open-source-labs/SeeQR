import React, { Component, MouseEvent, ChangeEvent } from 'react';
// import PropTypes from "prop-types";
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

type SchemaModalProps = {
  show: boolean;
  onClose: any;
};

type state = {
  schemaString: string;
};

class SchemaModal extends Component<SchemaModalProps, state> {
  constructor(props: SchemaModalProps) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSchemaFile = this.handleSchemaFile.bind(this);
    this.handleSchemaEntry = this.handleSchemaEntry.bind(this);

    // this.handleQueryPrevious = this.handleQueryPrevious.bind(this);
    // this.handleQuerySubmit = this.handleQuerySubmit.bind(this);
  }

  state: state = {
    schemaString: '',
  };

  // Load schema file path
  handleSchemaFile(event: any) {
    this.setState({ schemaString: event.target.value });
  }

  handleSchemaEntry(event: any) {
    this.setState({ schemaString: event.target.value });
  }

  handleSubmit(event: any) {
    event.preventDefault();
    console.log(this.state.schemaString);
    ipcRenderer.send('edit-schema', this.state.schemaString);
  }

  onClose = (event: any) => {
    this.props.onClose && this.props.onClose(event);
  };

  render() {
    if (!this.props.show) {
      return null;
    }
    return (
      <div className="modal" id="modal">
        <div className="content">{this.props.children}</div>
        <h3>Load or input schema</h3>
        <form onSubmit={this.handleSubmit}>
          <p>First...</p>
          <input className="schema-label" type="text" placeholder="Input schema label..." />
          <p>Then...</p>
          <button onClick={this.handleSchemaFile}>Load Schema</button>
          <p>Or...</p>
          <input
            className="schema-text-field"
            type="text"
            placeholder="Input Schema Here..."
            onChange={(e) => this.handleSchemaEntry(e)}
          />
          {/* <input type="select" onClick={this.handleQueryPrevious}/> */}
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
// SchemaModal.propTypes = {
//   onClose: PropTypes.func.isRequired,
//   show: PropTypes.bool.isRequired
// };
export default SchemaModal;
