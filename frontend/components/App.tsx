import React, { Component } from 'react';
import { Splash } from './Splash';
import MainPanel from './MainPanel';
// import '../assets/stylesheets/css/style.css';

const { dialog } = require('electron').remote;
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

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
  state: state = {
    openSplash: true,
  };

  handleFileClick(event: ClickEvent) {
    // event.preventDefault();
    // alert('event triggered');
    // const options = {
    //   filters: [{ name: 'Custom File Type', extensions: ['tar', 'sql'] }],
    // };
    dialog
      .showOpenDialog(
        {
          properties: ['openFile'],
          filters: [{ name: 'Custom File Type', extensions: ['tar', 'sql'] }],
          message: 'Please upload .sql or .tar database file'
        },
        // (files: string) => {
        //   if (files !== undefined) {
        //     // handle files
        //     console.log('cancelled');
        //   }
        // }
      )
      .then((result: object) => {
        console.log('file uploaded', result);
        // const ifCancelled = Object.keys(result)
        // console.log(ifCancelled)
        // console.log(result["canceled"])
        const filePathArr = result["filePaths"];
        // send via channel to main process
        if (!result["canceled"]){
          ipcRenderer.send('upload-file', filePathArr);
          this.setState({ openSplash: false });
        }
      })
      .catch((err: object) => {
        console.log(err);
      });
  }

  handleSkipClick(event: ClickEvent) {
    ipcRenderer.send('skip-file-upload');
    this.setState({ openSplash: false });
  }

  render() {
    // ipcRenderer.on('open-splash', (event: any, splashState: object) => {
    //   this.setState(splashState);
    // });
    // listen for menu to invoke handleFileClick
    ipcRenderer.on('menu-upload-file', () => {
      this.handleFileClick;
    });
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

// export default App;
