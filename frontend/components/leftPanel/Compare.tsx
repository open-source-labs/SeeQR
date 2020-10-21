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

  // -------------------------------------------------------------------------------------------------------------
  // ------------------------------------ logic for setting state --------------------------------------------
  // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

  // declaring initial state
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

  // -------------------------------------------------------------------------------------------------------------
  // ------------------------------------ logic for the compare query table --------------------------------------
  // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

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

  // Rendering the compare table with selected queries from dropdown list
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

  // -------------------------------------------------------------------------------------------------------------
  // ------------------------------------ logic for the compare query graph --------------------------------------
  // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

  const generateDatasets = () => {
    const { compareList } = queryInfo;

    // first we create an object with all of the comparelist data organized in a way that enables us to render our graph easily
    const compareDataObject: any = {};
    // then we populate that object
    for (const query of compareList){
      const { queryLabel, querySchema, queryStatistics } = query;
      if (!compareDataObject[querySchema]){
        compareDataObject[querySchema] = {
          [queryLabel.toString()] : queryStatistics[0]["QUERY PLAN"][0]["Execution Time"] + queryStatistics[0]["QUERY PLAN"][0]["Planning Time"]
        }
      } else {
        compareDataObject[querySchema][queryLabel.toString()] = queryStatistics[0]["QUERY PLAN"][0]["Execution Time"] + queryStatistics[0]["QUERY PLAN"][0]["Planning Time"]
      }
    };

    // then we generate a labelData array to store all unique query labels
    const labelDataArray: any = [];
    for (const schema in compareDataObject){
      for (const label in compareDataObject[schema]) {
        if (!labelDataArray.includes(label)){
          labelDataArray.push(label);
        } 
      }
    }

    
    // then we generate an array of data for each schema, storing data for each unique query according to the schema
    const runTimeDataArray: any = [];
    for (const schema in compareDataObject){
      const schemaArray: any = [];
      for(const label of labelDataArray){
        schemaArray.push(compareDataObject[schema][label] ? compareDataObject[schema][label] : 0)
      }
      runTimeDataArray.push({[schema]: schemaArray});
    }

    // creating a list of possible colors for the graph
    const schemaColors = {
      nextColor: 0,
      colorList: ['#006C67', '#F194B4', '#FFB100', '#FFEBC6', '#A4036F', '#048BA8', '#16DB93', '#EFEA5A', '#F29E4C']
    }

    // then we generate datasets for each schema for the bar chart
    const datasets = runTimeDataArray.map((schemaDataObject) => {
      const schemaLabel: any = Object.keys(schemaDataObject)[0];
      const color = schemaColors.colorList[schemaColors.nextColor % schemaColors.colorList.length];
      schemaColors.nextColor += 1;
      return {
        label: `${schemaLabel}`,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        data: schemaDataObject[schemaLabel]
      }
    })

    //then we combine the label array and the data arrays for each schema into a data object to pass to our bar graph
    return {
      labels: labelDataArray,
      datasets: datasets
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // ------------------------------------ rendering the elements -------------------------------------------------
  // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

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
          data={generateDatasets()}
          options={{
            title: {
              display: true,
              text: 'QUERY LABEL VS RUNTIME (ms)',
              fontSize: 16
            },
            legend: {
              display: true,
              position: 'right'
            },
            maintainAspectRatio: false
          }}
        />
      </div>
    </div>
  );
};

