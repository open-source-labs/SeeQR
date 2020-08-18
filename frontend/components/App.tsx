import React, { Component, MouseEvent } from 'react';
import { Splash } from './Splash';
import MainPanel from './MainPanel';
// import '../assets/stylesheets/css/style.css';

const { dialog } = require('electron').remote;
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type state = {
  openSplash: boolean;
  //files: string[];
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
    //files: [],
  };

  handleFileClick(event: ClickEvent) {
    // event.preventDefault();
    // alert('event triggered');
    const options = {
      filters: [{ name: 'All Files', extensions: ['*'] }],
    };
    dialog
      .showOpenDialog(
        {
          properties: ['openFile', 'multiSelections'],
        },
        (files: string) => {
          if (files !== undefined) {
            // handle files
            console.log('file path undefined');
          }
        }
      )
      .then((result: object) => {
        // there is definitely a better way to reference the object key of filePaths
        const filePathArr = Object.values(result)[1];
        // send via channel to main process
        ipcRenderer.send('database-file-submission', filePathArr)
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
