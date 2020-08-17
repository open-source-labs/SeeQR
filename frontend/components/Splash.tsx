import React, { Component, MouseEvent } from 'react';
import '../assets/stylesheets/styles.css';
const { dialog } = require('electron').remote;

type SplashProps = {
  openSplash: boolean;
};

export class Splash extends Component<SplashProps> {
  // a dialogue menu with retrieve the file path
  constructor(props: SplashProps) {
    super(props);
    this.handleFileClick = this.handleFileClick.bind(this);
  }

  handleFileClick(event: MouseEvent) {
    const options = {
      filters: [{ name: 'All Files', extensions: ['*'] }],
    };
    dialog.showOpenDialog( 
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
        console.log('result', result);
      })
      .catch((err: object) => {
        console.log(err);
      });
  }
  render() {
    return (
      <div>
        <h1 style={{ color: 'black' }}>SeeQR!</h1>
        <h3 style={{ color: 'black' }}>Welcome!</h3>
        <h3 style={{ color: 'black' }}>Import database?</h3>
        <button>Skip</button>
        <button onClick={this.handleFileClick}>Yes</button>
      </div>
    );
  }
}

// export const Splash;
