import React, { Component } from 'react';
import { Splash } from './Splash';
import MainPanel from './MainPanel';
import '../assets/stylesheets/styles.css';

type state = {
  openSplash: boolean;
  //files: string[];
};
type AppProps = {};

export class App extends Component<AppProps, state> {
  constructor(props: AppProps) {
    super(props);
  }
  state: state = {
    openSplash: true,
    //files: [],
  };

  render() {
    return (
      <div>
        {this.state.openSplash ? (
          <Splash openSplash={this.state.openSplash} />
        ) : (
          <MainPanel />
        )}
      </div>
    );
  }
}

// export default App;
