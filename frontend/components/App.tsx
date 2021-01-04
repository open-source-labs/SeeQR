import React, { Component } from 'react';
import { Splash } from './Splash';
import MainPanel from './MainPanel';

// const { dialog } = require('electron').remote;
// const { ipcRenderer } = window.require('electron');

// type ClickEvent = React.MouseEvent<HTMLElement>;

type state = {
  openSplash: boolean;
};

type AppProps = {};

export class App extends Component<AppProps, state> {
  constructor(props: AppProps) {
    super(props);
    this.handleFileClick = this.handleFileClick.bind(this);
    this.handleSkipClick = this.handleSkipClick.bind(this);
  }

  // Splash page will always render upon opening App
  state: state = {
    openSplash: false,
  };

  async handleFileClick(event) {
    const files = event.target.files;
    const formData = new FormData();
    formData.append('myFile', files[0]);
    console.log(files);

    const response = await fetch('/schema/upload-file', {
      method: 'POST',
      body: formData,
    });

    this.setState({ openSplash: false });
    // dialog
    //   .showOpenDialog({
    //     properties: ['openFile'],
    //     filters: [{ name: 'Custom File Type', extensions: ['tar', 'sql'] }],
    //     message: 'Please upload .sql or .tar database file',
    //   })
    //   .then((result: object) => {
    //     const filePathArr = result['filePaths'];
    //     // send via channel to main process
    //     if (!result['canceled']) {
    //       ipcRenderer.send('upload-file', filePathArr);
    //       this.setState({ openSplash: false });
    //     }
    //   })
    //   .catch((err: object) => {
    //   });
  }

  // Skips file upload and moves to main page.
  handleSkipClick(event) {
    // ipcRenderer.send('skip-file-upload');
    this.setState({ openSplash: false });
  }

  render() {
    // listen for menu to invoke handleFileClick
    // ipcRenderer.on('menu-upload-file', () => {
    //   this.handleFileClick;
    // });

    return (
      <div>
        {this.state.openSplash ? (
          <Splash
            openSplash={this.state.openSplash}
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
