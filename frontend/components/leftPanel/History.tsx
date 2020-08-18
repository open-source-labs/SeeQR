import React, { Component, MouseEvent } from 'react';
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type HistoryProps = {

}

export const History = (props: HistoryProps) => {
  
  
    return (
      <div>
        <h3 style={{border: '1px solid blue'}}>History Panel</h3>
      </div>
    );
  
}
