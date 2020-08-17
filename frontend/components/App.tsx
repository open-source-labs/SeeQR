import React, { Component } from 'react';
import { Splash } from './Splash';
import '../assets/stylesheets/styles.css';
// import { MainPanel } from './MainPanel';

// set state of openApp to true, passing set state of setOpenApp
// FC = function component
// SFC = stateless functional component

type state = {
  openSplash: boolean;
};
type AppProps = {};

//const App: React.FC = () => {
export class App extends Component<AppProps, state> {
  constructor(props: AppProps) {
    super(props);
  }
  state: state = {
    openSplash: false,
  };

  render() {
    //const [openApp, setOpenApp] = useState(true);
    // if openApp eval truthy, pass setOpenApp to Splash, otherwise load main component
    return (
      <div>
        <Splash openSplash={this.state.openSplash} />
      </div>
    );
  }
}

// export default App;
