import React, { Component, MouseEvent } from 'react';
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type ResultsProps = {

}

export const Results = (props: ResultsProps) => {
  
  
  return (
    <div>
      <h3 style={{border: '1px solid blue'}}>Results Panel</h3>
    </div>
  );

}
