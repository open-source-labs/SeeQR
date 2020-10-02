import React, { useState } from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { Bar, defaults } from "react-chartjs-2";

defaults.global.defaultFontColor = 'rgb(198,210,213)';

type CompareProps = {
  queries: {
    queryString: string;
    queryData: {}[];
    queryStatistics: any
    querySchema: string;
    queryLabel: string;
  }[];
  currentSchema: string
};

export const Compare = (props: CompareProps) => {
  // initial state
  let initial: any = { ...props, compareList: [] }; 

  const [queryInfo, setCompare] = useState(initial);
  const addCompareQuery = (event) => {
    // compare list is a dropdown menu on the front-end
    let compareList = queryInfo.compareList;
    props.queries.forEach((query) => {
      // if the query is clicked in the dropdown menu
      if (query.queryLabel === event.target.text) {
        // only allow the addition of queries that aren't already being compared
        if (!compareList.includes(query)){
          compareList.push(query);
        }
      }
    });
    // reset state to account for the change in queries being tracked
    setCompare({ ...queryInfo, compareList });
  }

  const deleteCompareQuery = (event) => {
    // reset comparelist so that the query that is chosen is not included any more
    let compareList: any = queryInfo.compareList.filter(
      (query) => query.queryLabel !== event.target.id);
    setCompare({ ...queryInfo, compareList });
  }

  const dropDownList = () => {
    // for each query on the query list, make a dropdown item in the menu
    return props.queries.map((query, index) => <Dropdown.Item key={index} className="queryItem" onClick={addCompareQuery}>{query.queryLabel}</Dropdown.Item>);
  };

  const renderCompare = () => {
    return queryInfo.compareList.map((query, index) => {
      // destructuring data and variables from queries on the compare list
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

      // To display additional analytics, comment back in JSX elements in the return statement below.
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
          <td><button id={queryLabel} className="delete-query-button" onClick={deleteCompareQuery}>X</button></td>
        </tr>
      );
    });
  };

  const { compareList } = queryInfo;
  
  // first we create an object with all of the comparelist data organized in a way that enables us to render our graph easily
  const compareDataObject = () => {
    const catchObject = {};

    for (const query of compareList){
      const { queryLabel, querySchema, queryStatistics } = query;
      if (!catchObject[queryLabel]){
        catchObject[queryLabel] = {
          [querySchema.toString()] : queryStatistics[0]["QUERY PLAN"][0]["Execution Time"] + queryStatistics[0]["QUERY PLAN"][0]["Planning Time"]
        }
      } else {
        catchObject[queryLabel][querySchema.toString()] = queryStatistics[0]["QUERY PLAN"][0]["Execution Time"] + queryStatistics[0]["QUERY PLAN"][0]["Planning Time"]
      }
    };
    
    return catchObject;
  }


  // pull the label and runtime data to render the query on the graph
  // labelData is an array of all the unique query labels
  const labelData = () => compareList.map((query) => query.queryLabel);
  // runtimeData is an array of data points where the index of the query data matches the index of the label it corresponds to in the labelData array
  // there is a unique array of runtime data for each unique schema
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
      <DropdownButton id="add-query-button" title="Add Query Data &#9207;">
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

