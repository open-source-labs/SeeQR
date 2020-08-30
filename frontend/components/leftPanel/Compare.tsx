import React, { Component, MouseEvent } from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type CompareProps = {
    queries: {
    queryLabel: string;
    queryStatistics: any;
    querySchema: string;
  }[];
  currentSchema: string
};


export const Compare = (props: CompareProps) => {



  const showQueryList = () => {

  };


  return (
    <div id="compare-panel">
      <h3>Compare</h3>
        <DropdownButton id="add-query-button" title="Add Query">
        <Dropdown.Item className="query-item" href="#/action-1">Action</Dropdown.Item>
        <Dropdown.Item className="query-item" href="#/action-2">Another action</Dropdown.Item>
        <Dropdown.Item className="query-item" href="#/action-3">Something else</Dropdown.Item>
        </DropdownButton>
        <table className="compare-box">
          <tbody>
            <tr className="top-row">
              <td>{'Query Label'}</td>
              <td>{'Schema'}</td>
              <td>{'Total Rows'}</td>
              <td>{'Total Time'}</td>
            </tr>
          </tbody>
        </table>
    </div>
  );
};

