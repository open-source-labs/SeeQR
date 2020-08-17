import React, { useState } from 'react';
import Splash from './Splash';
import Main from './Main';

// const { remote } = require('electron');
// const { dialog } = remote;

// set state of openApp to true, passing set state of setOpenApp
// FC = function component
// SFC = stateless functional component

const App: React.FC = () => {
  const [openApp, setOpenApp] = useState(true);
  // if openApp eval truthy, pass setOpenApp to Splash, otherwise load main component
  return openApp ? <Splash setOpenApp={setOpenApp} /> : <Main />;
  //constructor(props: any) {
  //super(props);
  // this.handleFileClick = this.handleFileClick.bind(this);
  //}

  // handleFileClick() {
  //   const options = {
  //     filters: [
  //       { name: 'Images', extensions: ['png'] },
  //       { name: 'Custom File Type', extensions: ['as'] },
  //     ]
  //   }

  //   dialog.showOpenDialog({
  //     properties: ['openFile', 'multiSelections']
  //   }, function (files) {
  //     if (files !== undefined) {
  //       // handle files
  //       console.log('file path undefined');
  //     }
  //   })
  //     .then(result => {
  //       console.log('result', result);
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     })
  // };

  // return (
  //   <div>
  //     <h1 style={{ color: 'black' }}>SeeQR!</h1>
  //     {/* <h3 style={{ "color": "black" }}>Welcome!</h3>
  //     <h3 style={{ "color": "black" }}>Import database?</h3>
  //     <button>Skip</button>
  //     <button onClick={this.handleFileClick}>Yes</button> */}
  //   </div>
  // );
};

export default App;
