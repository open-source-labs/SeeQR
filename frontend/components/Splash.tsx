import React, { useState, useEffect } from 'react';
import '../style/style.css';
import dialog from 'electron';

// for safetyping any react components.
export interface SplashProps {
  setOpenApp: React.Dispatch<React.SetStateAction<boolean>>;
}
// export a file obj in the state
export interface File {
  filePath: string;
}

const Splash: React.FC<SplashProps> = ({ setOpenApp }) => {
  const [file, setFile] = useState<File>();
  // a dialogue menu with retrieve the file path
  const getFile = async () => {
    dialog
      .showOpenDialog(
        {
          properties: ['openFile', 'multiSelections'],
        },
        (input: any) => {
          if (input !== undefined) {
            // handle files
            console.log('file path undefined');
          }
        }
      )
      .then((result: any) => {
        setFile(result);
        console.log('result', result);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };
  // run dialogue menu
  useEffect(() => {
    getFile();
  }, []);
  return (
    <div>
      <h3>{file}</h3>
    </div>
  );
};

export default Splash;
