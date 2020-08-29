import React, { Component, MouseEvent } from 'react';
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



  return (
    <div id="compare-panel">
      <h3>Comparisons</h3>
        {/* <tr key={index}>
          <td id="query-label">{queryLabel}</td>
          <td id="schema-name">{querySchema}</td>
          <td id="actual-rows">{actualRows}</td>
          <td id="total-time">{actualTotalTime}</td>
        </tr> */}
    </div>
  );
};

