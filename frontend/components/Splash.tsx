import React, { Component } from 'react';

type SplashProps = {
  openSplash: boolean;
  handleFileClick: any;
  handleSkipClick: any;
};

export default class Splash extends Component<SplashProps> {
  // a dialogue menu with retrieve the file path
  constructor(props: SplashProps) {
    super(props);
  }

  render() {
    return (
      <div id="splash-page">
        <div className="logo" />

        <h4>Welcome!</h4>
        <div className="splash-buttons">
          <div id="custom-schema">
            <h4>Create custom schema</h4>
            <button id="skip_button" onClick={this.props.handleSkipClick}>
              Create
            </button>
          </div>
          <div id="import-schema">
            <h4>Import database in .sql or .tar</h4>
            <button id="yes_button" onClick={this.props.handleFileClick}>
              Import
            </button>
          </div>
        </div>
      </div>
    );
  }
}
