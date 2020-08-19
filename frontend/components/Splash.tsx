import React, { Component, MouseEvent } from 'react';
// const { dialog } = require('electron').remote;
// const { ipcRenderer } = window.require('electron');

type SplashProps = {
  openSplash: boolean;
  handleFileClick: any;
  handleSkipClick: any;
  //files: string[];
};

export class Splash extends Component<SplashProps> {
  // a dialogue menu with retrieve the file path
  constructor(props: SplashProps) {
    super(props);
  }

  render() {
    return (
      <div id="splash-menu">
        <h1 style={{ color: 'black' }}>SeeQR!</h1>
        <h3 style={{ color: 'black' }}>Welcome!</h3>
        <h3 style={{ color: 'black' }}>Import database?</h3>
        <button onClick={this.props.handleSkipClick}>Skip</button>
        <button onClick={this.props.handleFileClick}>Yes</button>
      </div>
    );
  }
}
