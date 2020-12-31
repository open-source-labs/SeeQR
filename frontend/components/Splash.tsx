import React from 'react';

type SplashProps = {
  openSplash: boolean;
  handleFileClick: any;
  handleSkipClick: any;
};

export function Splash (props: SplashProps) {
  // a dialogue menu with retrieve the file path
  return (
    <div id="splash-page">
      <div className="logo"></div>

        <h4>Welcome!</h4>
        <div className="splash-buttons">
          <div id="custom-schema">
            <h4>Create custom schema</h4>
            <button id="skip_button" onClick={props.handleSkipClick}>Create</button>
          </div>
          <div id="import-schema">
            <h4>Import database in .sql or .tar</h4>
            <button id="yes_button" onClick={props.handleFileClick}>Import</button>
          </div>
        </div>
        
    </div>
  );
}
