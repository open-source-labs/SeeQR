import React, { Component, MouseEvent } from 'react';
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type CompareProps = {};

export const Compare = (props: CompareProps) => {
  return (
    <div id="compare-panel">
      <h3>Compare Panel</h3>
    </div>
  );
};
