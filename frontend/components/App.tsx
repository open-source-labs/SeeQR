import React, { Component } from 'react';
import Splash from './Splash';
import MainPanel from './MainPanel';

const { dialog } = require('electron').remote;
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type state = {
  openSplash: boolean;
};

type AppProps = {};

export default class App extends Component<AppProps, state> {
  constructor(props: AppProps) {
    super(props);
    this.handleFileClick = this.handleFileClick.bind(this);
    this.handleSkipClick = this.handleSkipClick.bind(this);
  }

  // Splash page will always render upon opening App
  state: state = {
    openSplash: true,
  };

  handleFileClick() {
    dialog
      .showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Custom File Type', extensions: ['tar', 'sql'] }],
        message: 'Please upload .sql or .tar database file',
      })
      .then((result: object) => {
        const filePathArr = result['filePaths'];

        // send via channel to main process
        if (!result['canceled']) {
          ipcRenderer.send('upload-file', filePathArr);
          this.setState({ openSplash: false });
        }
      })
      .catch((err: object) => {
        console.log(err);
      });
  }

  // Skips file upload and moves to main page.
  handleSkipClick() {
    this.setState({ openSplash: false });
  }

  render() {
    // listen for menu to invoke handleFileClick
    ipcRenderer.on('menu-upload-file', () => {
      this.handleFileClick;
    });

    return (
      <div>
        {this.state.openSplash ? (
          <Splash
            handleFileClick={this.handleFileClick}
            handleSkipClick={this.handleSkipClick}
          />
        ) : (
          <MainPanel />
        )}
      </div>
    );
  }
}
