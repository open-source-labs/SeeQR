import React, { Component, MouseEvent, useState, useEffect } from 'react';
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
  let initial: any = {...props, compareList: [] };
  const [ queryInfo, setCompare ] = useState(initial);

  const addCompareQuery = (event) => {
    let compareList = queryInfo.compareList;
    props.queries.forEach((query) => {
      if (query.queryLabel === event.target.text){
        compareList.push(query);
      }
    });
    setCompare({...queryInfo, compareList});
  }

  const deleteCompareQuery = (event) => {
    let compareList: any = queryInfo.compareList.filter(
      (query) => query.queryLabel !== event.target.id);
      setCompare({...queryInfo, compareList});
    }

    const dropDownList = () => {
      return props.queries.map((query, index) => <Dropdown.Item id={`query-item${index}`} className="queryItem" onClick={addCompareQuery}>{query.queryLabel}</Dropdown.Item>);
    };

    const renderCompare = () => {
    return queryInfo.compareList.map((query, index) => {
      const { queryStatistics, querySchema, queryLabel } = query;
      const { ["QUERY PLAN"]: queryPlan } = queryStatistics[0];
      const {
        Plan,
        ["Planning Time"]: planningTime,
        ["Execution Time"]: executionTime,
      } = queryPlan[0];
      const {
        ["Actual Rows"]: actualRows,
        ["Actual Total Time"]: actualTotalTime,
      } = Plan;

      return (
        <tr key={index}>
          <td id="query-label">{queryLabel}</td>
          <td id="schema-name">{querySchema}</td>
          <td id="actual-rows">{actualRows}</td>
          <td id="total-time">{actualTotalTime}</td>
          <button id={queryLabel} className="delete-query-button" onClick={deleteCompareQuery}>X</button>
        </tr>
      );
    });
  };

  return (
    <div id="compare-panel">
      <h3>Compare</h3>
        <DropdownButton id="add-query-button" title="Add Query Data">
          {dropDownList()}
        </DropdownButton>
        <table className="compare-box">
          <tbody>
            <tr className="top-row">
              <td>{'Query Label'}</td>
              <td>{'Schema'}</td>
              <td>{'Total Rows'}</td>
              <td>{'Total Time'}</td>
            </tr>
            {renderCompare()}
          </tbody>
        </table>
    </div>
  );
};

