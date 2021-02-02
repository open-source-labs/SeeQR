import React from 'react';

type SplashProps = {
  handleFileClick: () => void;
  handleSkipClick: () => void;
};

const Splash = ({ handleFileClick, handleSkipClick }: SplashProps) => (
  <div id="splash-page">
    <div className="logo" />

    <h4>Welcome!</h4>
    <div className="splash-buttons">
      <div id="custom-schema">
        <h4>Create custom schema</h4>
        <button type="button" id="skip_button" onClick={handleSkipClick}>
          Create
        </button>
      </div>
      <div id="import-schema">
        <h4>Import database in .sql or .tar</h4>
        <button type="button" id="yes_button" onClick={handleFileClick}>
          Import
        </button>
      </div>
    </div>
  </div>
);

export default Splash;
