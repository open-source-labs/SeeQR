import React, { Component, MouseEvent, useState } from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
const { ipcRenderer } = window.require('electron');
import { Bar, defaults } from "react-chartjs-2";

defaults.global.defaultFontColor = 'rgb(198,210,213)';

type CompareProps = {
  queries: {
    queryLabel: string;
    queryStatistics: any;
    querySchema: string;
  }[];
  currentSchema: string
};

export const Compare = (props: CompareProps) => {
  let initial: any = { ...props, compareList: [] };

  const [queryInfo, setCompare] = useState(initial);
  const addCompareQuery = (event) => {
    let compareList = queryInfo.compareList;
    props.queries.forEach((query) => {
      if (query.queryLabel === event.target.text) {
        compareList.push(query);
      }
    });
    setCompare({ ...queryInfo, compareList });
  }

  const deleteCompareQuery = (event) => {
    let compareList: any = queryInfo.compareList.filter(
      (query) => query.queryLabel !== event.target.id);
    setCompare({ ...queryInfo, compareList });
  }

  const dropDownList = () => {
    return props.queries.map((query, index) => <Dropdown.Item key={index} id={`query-item${index}`} className="queryItem" onClick={addCompareQuery}>{query.queryLabel}</Dropdown.Item>);
  };

  const renderCompare = () => {
    return queryInfo.compareList.map((query, index) => {
      const { queryString, queryData, queryStatistics, querySchema, queryLabel } = query;
      const { ['QUERY PLAN']: queryPlan } = queryStatistics[0];
      const {
        Plan,
        ['Planning Time']: planningTime,
        ['Execution Time']: executionTime,
      } = queryPlan[0];
      const {
        ['Node Type']: scanType,
        ['Actual Rows']: actualRows,
        ['Actual Startup Time']: actualStartupTime,
        ['Actual Total Time']: actualTotalTime,
        ['Actual Loops']: loops,
      } = Plan;
      const runtime = (planningTime + executionTime).toFixed(3);

      return (
        <tr key={index}>
          <td id='label'>{queryLabel}</td>
          <td id="schema-name">{querySchema}</td>
          {/* <td id="query-string">{queryString}</td> */}
          {/* <td id="scan-type">{scanType}</td> */}
          <td id="actual-rows">{actualRows}</td>
          <td id="runtime">{runtime}</td>
          {/* <td id='planning-time'>{planningTime}</td>
              <td id='execution-time'>{executionTime}</td>
              <td id='time-fl'>{actualStartupTime}</td> */}
          <td id='time-al'>{actualTotalTime}</td>
          {/* <td id="loops">{loops}</td> */}
          <button id={queryLabel} className="delete-query-button" onClick={deleteCompareQuery}>X</button>
        </tr>
      );
    });
  };

  const { compareList } = queryInfo;
  const labelData = () => compareList.map((query) => query.queryLabel);
  const runtimeData = () => compareList.map(
    (query) => query.queryStatistics[0]["QUERY PLAN"][0]["Execution Time"] + query.queryStatistics[0]["QUERY PLAN"][0]["Planning Time"]);
  const data = {
    labels: labelData(),
    datasets: [
      {
        label: 'Runtime',
        backgroundColor: 'rgb(108, 187, 169)',
        borderColor: 'rgba(247,247,247,247)',
        borderWidth: 2,
        data: runtimeData(),
      }
    ]
  };

  return (
    <div id="compare-panel">
      <h3>Comparisons</h3>
      <DropdownButton id="add-query-button" title="Add Query Data">
        {dropDownList()}
      </DropdownButton>
      <div className="compare-container">
        <table className="compare-box">
          <tbody>
            <tr className="top-row">
              <td>{'Query Label'}</td>
              <td>{'Schema'}</td>
              <td>{'Total Rows'}</td>
              {/* <td>{'Scan Type'}</td> */}
              {/* <td>{'Query'}</td> */}
              <td>{'Runtime (ms)'}</td>
              <td>{'Total Time'}</td>
              {/* <td>{'Returned Rows'}</td> */}
              {/* <td>{'Loops'}</td> */}
            </tr>
            {renderCompare()}
          </tbody>
        </table>
      </div>
      <div className="bar-chart">
        <Bar
          data={data}
          options={{
            title: {
              display: true,
              text: 'QUERY LABEL VS RUNTIME (ms)',
              fontSize: 16
            },
            legend: {
              display: false,
              position: 'right'
            }
          }}
        />
      </div>
    </div>
  );
};

