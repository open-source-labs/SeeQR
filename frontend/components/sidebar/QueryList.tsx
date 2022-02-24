import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import UploadIcon from '@material-ui/icons/File_Upload';
import styled from 'styled-components';
import { SidebarList } from '../../style-variables';
import { AppState, QueryData } from '../../types';
import { deleteQuery, setCompare, saveQuery, key as queryKey } from '../../lib/queries';
import QueryEntry from './QueryEntry';
import logo from '../../../assets/logo/seeqr_dock.png';
import { greyDarkest } from '../../style-variables';

import path from 'path';
import fs from 'fs';
import electron from 'electron';

type QueryListProps = Pick<
  AppState,
  | 'queries'
  | 'setQueries'
  | 'comparedQueries'
  | 'setComparedQueries'
  | 'workingQuery'
  | 'setWorkingQuery'
> & {
  createQuery: () => void;
  show: boolean;
};

const StyledSidebarList = styled(SidebarList)`
background-color: ${greyDarkest};
`;

// type LoadFiles = (path: string) => /**Record<string, QueryData>**/ Promise<Record<string, QueryData>> | Promise<void>;

// const loadFiles = function (path: string) {
//   let info: Record<string, QueryData> | undefined;

//   fs.stat(path, (err: object | null, state: object) => {
//     if (err) {
//       console.log(err);
//     } else {
//       info = JSON.parse(fs.readFileSync(path).toString());
//       console.log('line 44', info);
//       return info;
//     };
//   })
// }

// type FindFiles = () => any;

// const findFiles: FindFiles = async function () {
//   const globalAny: any = global;
//   if (process.platform !== 'darwin') {
//     // Resolves to a Promise<Object>
//     electron.remote.dialog.showOpenDialog({
//       title: 'Select the File to be uploaded',
//       defaultPath: path.join(__dirname, '../assets/'),
//       buttonLabel: 'Upload',
//       // Restricting the user to only Text Files.
//       filters: [
//         {
//           name: 'Text Files',
//           extensions: ['json', 'docx', 'txt']
//         },],
//       // Specifying the File Selector Property
//       properties: ['openFile']
//     }).then(file => {
//       // Stating whether dialog operation was
//       // cancelled or not.
//       if (!file.canceled) {
//         // Updating the GLOBAL filepath variable 
//         // to user-selected file.
//         globalAny.filepath = file.filePaths[0].toString();
//         // console.log(globalAny.filepath);
//         const data = JSON.parse(fs.readFileSync(globalAny.filepath).toString());
//         console.log(data);
//         return data;
//       }
//       return undefined;
//     }).catch((err: unknown | undefined) => {
//       console.log(err);
//       return undefined;
//     });
//   }
//   else {
//     // If the platform is 'darwin' (macOS)
//     electron.remote.dialog.showOpenDialog({
//       title: 'Select the File to be uploaded',
//       defaultPath: path.join(__dirname, '../assets/'),
//       buttonLabel: 'Upload',
//       filters: [
//         {
//           name: 'Text Files',
//           extensions: ['json', 'docx', 'txt']
//         },],
//       // Specifying the File Selector and Directory 
//       // Selector Property In macOS
//       properties: ['openFile', 'openDirectory']
//     }).then(file => {
//       // console.log('line 96', file.canceled);
//       if (!file.canceled) {
//         globalAny.filepath = file.filePaths[0].toString();
//         // console.log(globalAny.filepath);
//         const data = JSON.parse(fs.readFileSync(globalAny.filepath).toString());
//         console.log(data);
//         return data;
//       }
//       return undefined;
//     }).catch(err => {
//       console.log(err);
//       return undefined;
//     });
//   }
// }


const QueryList = ({
  queries,
  createQuery,
  setQueries,
  comparedQueries,
  setComparedQueries,
  workingQuery,
  setWorkingQuery,
  show,
}: QueryListProps) => {
  const deleteQueryHandler = (query: QueryData) => () => {
    setQueries(deleteQuery(queries, query));
    setComparedQueries(deleteQuery(comparedQueries, query));
  };
  
  const setComparisonHandler = (query: QueryData) => (
    evt: React.ChangeEvent<HTMLInputElement>
    ) => {
      setComparedQueries(setCompare(comparedQueries, query, evt.target.checked));
    };
  
  const saveQueryHandler = (query: QueryData) => () => { 
    saveQuery(query)
  }

  const loadQueryHandler = async function () { 
  //  const data = await findFiles();
  //   console.log(data);


  const globalAny: any = global;
    if (process.platform !== 'darwin') {
    // Resolves to a Promise<Object>
    electron.remote.dialog.showOpenDialog({
      title: 'Select the File to be uploaded',
      defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: 'Upload',
      // Restricting the user to only Text Files.
      filters: [
        {
          name: 'Text Files',
          extensions: ['json', 'docx', 'txt']
        },],
      // Specifying the File Selector Property
      properties: ['openFile']
    }).then(file => {
      // Stating whether dialog operation was
      // cancelled or not.
      if (!file.canceled) {
        // Updating the GLOBAL filepath variable 
        // to user-selected file.
        globalAny.filepath = file.filePaths[0].toString();
        // console.log(globalAny.filepath);
        const data = JSON.parse(fs.readFileSync(globalAny.filepath).toString());
        console.log(data);
        setQueries(data);
      }
      return undefined;
    }).catch((err: unknown | undefined) => {
      console.log(err);
      return undefined;
    });
  }
  else {
    // If the platform is 'darwin' (macOS)
    electron.remote.dialog.showOpenDialog({
      title: 'Select the File to be uploaded',
      defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: 'Upload',
      filters: [
        {
          name: 'Text Files',
          extensions: ['json', 'docx', 'txt']
        },],
      // Specifying the File Selector and Directory 
      // Selector Property In macOS
      properties: ['openFile', 'openDirectory']
    }).then(file => {
      // console.log('line 96', file.canceled);
      if (!file.canceled) {
        globalAny.filepath = file.filePaths[0].toString();
        // console.log(globalAny.filepath);
        const data = JSON.parse(fs.readFileSync(globalAny.filepath).toString());
        console.log(data);
        setQueries(data);
      }
      return undefined;
    }).catch(err => {
      console.log(err);
      return undefined;
    });
  }


    // console.log('LoadQuery Data:', data)
    // if (data){
    //   setQueries(data);
    // }
    // else return console.log('uh oh :(')
    // findFiles()
    // .then((res: Record<string, QueryData> | void) => {
    //   if (res) {
    //     console.log(res)
    //    return setQueries(res);
    //   }
    // })
   
    // console.log('before set queries', loadedQueries)
    // if (loadedQueries === undefined) return console.log('im undefined you IDIOTS')
    // setQueries(loadedQueries)
  }

  if (!show) return null;
  return (
    <>
      <span>
        <Tooltip title="New Query">
          <IconButton onClick={createQuery}>
            <AddIcon fontSize="large" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Import Query">
          <IconButton onClick={loadQueryHandler}>
            <UploadIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </span>

      <StyledSidebarList>
        {Object.values(queries).map((query: QueryData) => (
          <QueryEntry
            key={`QueryList_${query.label}_${query.db}`}
            query={query}
            select={() => setWorkingQuery(query)}
            isSelected={
              !!workingQuery && queryKey(query) === queryKey(workingQuery)
            }
            deleteThisQuery={deleteQueryHandler(query)}
            isCompared={!!comparedQueries[queryKey(query)]}
            setComparison={setComparisonHandler(query)}
            saveThisQuery={saveQueryHandler(query)} 
          />
        ))}
      </StyledSidebarList>
    </>
  );
};

export default QueryList;
