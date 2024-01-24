import path from 'path';
import * as fs from 'fs'
import React, { useContext, useState } from 'react';
import { Dialog, DialogTitle, Tooltip } from '@mui/material/';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  ButtonContainer,
  TextFieldContainer,
  StyledButton,
  StyledTextField,
  DropdownContainer,
  StyledInputLabel,
  StyledNativeDropdown,
  StyledNativeOption,
} from '../../style-variables';
import { DBType } from '../../../backend/BE_types';
import MenuContext from '../../state_management/Contexts/MenuContext';
// import { set } from 'mongoose';


type AddNewDbModalProps = {
  open: boolean;
  onClose: () => void;
  dbNames: string[] | undefined;
  curDBType: DBType | undefined;
};

function AddNewDbModal({
  open,
  onClose,
  dbNames,
  curDBType,
}: AddNewDbModalProps) {
  const { dispatch: menuDispatch } = useContext(MenuContext);

  const [newDbName, setNewDbName] = useState<string>('');

  const [fileSelect, setFileSelect] = useState<boolean>(true)

  const [selectedFilePath, setFilePath] = useState<string>('')

  const [selectedDBType, setDBType] = useState<string>('')

  const [isError, setIsError] = useState<boolean>(false);
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  // const [curDBType, setDBType] = useState<DBType>();

  // Resets state for error messages
  const handleClose = () => {
    setIsError(false);
    setIsEmpty(true);
    onClose();
  };

  // Error message depending on if the text field is empty or a duplicate
  const errorMessage = () => {
    if (isEmpty) {
      return 'Required: Database must have a name. Please enter a unique name.';
    }
    if (isError) {
      return 'This database name already exists. Please enter a unique name.';
    }
    return '';
  };

  /// / Set schema name
  const handleDbName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dbNameInput = event.target.value;
    if (dbNameInput.length === 0) {
      setIsEmpty(true);
    } else {
      setIsEmpty(false);
    }
    // check if the newDbName is not a duplicate
    let dbSafeName = dbNameInput;
    // convert input label name to lowercase only with no spacing to comply with db naming convention.
    dbSafeName = dbSafeName.replace(/[^\w-]/gi, '');
    if (dbNames?.includes(dbSafeName)) {
      setIsError(true);
    } else {
      setIsError(false);
    }
    setNewDbName(dbSafeName);
  };



    // Opens modal to select file 
    const selectDBFile = () => {
      const options = {
        title: 'Select DB File',
        defaultPath: path.join(__dirname, '../assets/'),
        buttonLabel: 'Select File',
        filters: [
          {
            name: 'Custom File Type',
            extensions: ['sql', 'tar'],
          },
        ],
      };

   
      // checks sql file if it already has a `CREATE DATABASE` query. If so, a input field wont be needed.
        // if there is no such query, you will need to input a db name.
      const checkDBFile = (filePath: string, dbName: string) => {
   
           // TODO: fix the any type.
        const dbt: DBType = (document.getElementById('dbTypeDropdown') as any).value;
      
        console.log('dbtype', dbt)
        console.log('filepath', filePath)
        
        setFilePath(filePath)
        
        setDBType(dbt)

        fs.readFile(filePath, 'utf-8', (err, data)=> {
          if(err) {
            console.error(`Error reading file: ${err.message}`);
            return;
          }
    
          // this is for sql files that already have a name via CREATE DATABASE 
          const dataArr = data.replace(/`([^`]+)`|\b([a-zA-Z_]+)\b/g, '$1$2').replace(/;/g, '').match(/\S+/g) || [];
          const keyword1 = 'CREATE';
          const keyword2 = 'DATABASE';
          const keyword3 = 'USE'
          console.log('data', dataArr)
          
          const containsKeywords = dataArr.some((word, index) => {
            // Check if the current word is 'CREATE' and the next word is 'DATABASE'
            if (word === keyword1 && dataArr[index + 1] === keyword2) {
              return true;
            }
            return false;
          });
        
          /* checks if the keyword exist in our database file */
           if(containsKeywords) {
            let fileDbName = ''
            let payloadObj
            console.log('keywords exist:', containsKeywords);

            // mysql is different where you need to create a database before importing.
            // most mysql files will have a create database query in file
            // this function will create a database first
            if (dbt === DBType.Postgres) {
       
              // eslint-disable-next-line no-restricted-syntax
              for (const [index, word] of dataArr.entries()) {
                if (word === keyword1 && dataArr[index + 1] === keyword2) {
                  // Assuming the database name is the next word after 'DATABASE'
                  fileDbName = dataArr[index + 2];
                }
              }
              payloadObj = { newDbName, filePath, dbType: dbt};
            } else if (dbt === DBType.MySQL) {
            
                // eslint-disable-next-line no-restricted-syntax
                for (const [index, word] of dataArr.entries()) {
                  if (word === keyword3) {
                    // Assuming the database name is the next word after 'DATABASE'
                    fileDbName = dataArr[index + 1];
                  }
                }
                payloadObj = { newDbName: fileDbName, filePath, dbType: dbt};
              }

              
            // handles import if keywords exists
            const handleDBImport = (closeModal: () => void) => {
            menuDispatch({
              type: 'ASYNC_TRIGGER',
              loading: 'LOADING',
              options: {
                event: 'import-db',
                payload: payloadObj,
                callback: closeModal,
              },
            });
          };

          handleDBImport(handleClose)
          
            } else {
              // if keywords dont exist, this will render input field
              setFileSelect(false)

              console.log('keywords exist:', containsKeywords);
            }
        });
      }

  // initial async call when pressing select file button
      menuDispatch({
        type: 'ASYNC_TRIGGER',
        loading: 'LOADING',
        options: {
          event: 'showOpenDialog',
          payload: options,
          callback: checkDBFile,
        },
      });
    };


    // some sql files will have keywords that are invalid which will need to be edited manually in sql file before importing
    const handleDBImport = (dbName: string, closeModal: () => void) => {
      menuDispatch({
        type: 'ASYNC_TRIGGER',
        loading: 'LOADING',
        options: {
          event: 'import-db',
          payload: {  newDbName: dbName, filePath: selectedFilePath , dbType: selectedDBType},
          callback: closeModal,
        },
      });
      setFileSelect(true)
    };


    

  return (
    <div>
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={handleClose}
        aria-labelledby="modal-title"
        open={open}
      >
        <TextFieldContainer>
          <DialogTitle id="alert-dialog-title">
            Import Existing SQL or TAR File
          </DialogTitle>

        {!fileSelect ?
          <Tooltip title="Any special characters will be removed">
            <StyledTextField
              required
              error={isError}
              helperText={errorMessage()}
              id="filled-basic"
              label="Enter a database name"
              size="small"
              variant="outlined"
              onChange={handleDbName}
              InputProps={{
                style: { color: '#575151' },
              }}
            />
          </Tooltip>
          : <> </>
          }


        </TextFieldContainer>
        <DropdownContainer>
          <StyledInputLabel
            id="dbtype-select-label"
            variant="standard"
            htmlFor="uncontrolled-native"
          >
            Database Type
          </StyledInputLabel>
          <StyledNativeDropdown
            id="dbTypeDropdown"
            defaultValue={DBType.Postgres}
          >
            <StyledNativeOption value={DBType.Postgres}>
              Postgres
            </StyledNativeOption>
            <StyledNativeOption value={DBType.MySQL}>MySQL</StyledNativeOption>
          </StyledNativeDropdown>
        </DropdownContainer>
        <ButtonContainer>
          <StyledButton
            variant="contained"
            color="secondary"
            onClick={handleClose}
          >
            Cancel
          </StyledButton>


          {
            fileSelect ?
           <StyledButton
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={
             () => selectDBFile()
            } 
          
          >
            Select File
          </StyledButton>
            :
          <StyledButton
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={
              isEmpty || isError
                ? () => {}
                : () => handleDBImport(newDbName, handleClose) 
            }
          >
            Import
          </StyledButton>
          }
          
          
        </ButtonContainer>
      </Dialog>
    </div>
  );
}

export default AddNewDbModal;
