import React, { Component } from 'react';
import { Line, defaults } from "react-chartjs-2";

type ResultsProps = {
  queries: any;
};

defaults.global.defaultFontColor = 'rgb(198,210,213)';

export class Results extends Component<ResultsProps> {
  constructor(props: ResultsProps) {
    super(props);
  }
  renderTableData() {

    return this.props.queries.map((query, index) => {
      // destructure state from mainPanel, including destructuring object returned from Postgres
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
          <td id="query-string">{queryString}</td>
          {/* <td id="scan-type">{scanType}</td> */}
          <td id='planning-time'>{planningTime}</td>
          <td id="runtime">{runtime}</td>
          {/* <td id='execution-time'>{executionTime}</td>
              <td id='time-fl'>{actualStartupTime}</td> */}
          {/* <td id='time-al'>{actualTotalTime}</td> */}
          {/* <td id="actual-rows">{actualRows}</td> */}
          <td id="loops">{loops}</td>
          {/* <td id='notes'>{'Notes'}</td> */}
        </tr>
      );
    });
  }

  render() {
    const { queries } = this.props;
    const labelData = () => queries.map((query) => query.queryLabel);
    const runtimeData = () => queries.map(
      (query) => query.queryStatistics[0]["QUERY PLAN"][0]["Execution Time"] + query.queryStatistics[0]["QUERY PLAN"][0]["Planning Time"]);
    const data = {
      labels: labelData(),
      datasets: [
        {
          label: 'Runtime',
          fill: false,
          lineTension: 0.5,
          backgroundColor: 'rgb(108, 187, 169)',
          borderColor: 'rgba(247,247,247,247)',
          borderWidth: 2,
          data: runtimeData(),
        }
      ]
    }

    // To display additional analytics, comment back in JSX elements in the return statement below.
    return (
      <div id="results-panel">
        <h3>Results</h3>
        <div className="results-container">
          <table id="results">
            <tbody>
              <tr className="top-row">
                <td>{'Query Label'}</td>
                <td>{'Query'}</td>
                {/* <td>{'Scan Type'}</td> */}
                <td>{'Planning Time'}</td>
                <td>{'Runtime (ms)'}</td>
                {/* <td>{'Execution Time'}</td>
              <td>{'Time: First Line (ms)'}</td>
            <td>{'Time: All Lines (ms)'}</td> */}
                {/* <td>{'Returned Rows'}</td> */}
                {/* <td>{'Total Time (ms)'}</td> */}
                <td>{'Loops'}</td>
                {/* <td>{'Notes'}</td> */}
              </tr>
              {this.renderTableData()}
            </tbody>
          </table>
        </div>
        <div className="line-chart">
          <Line
            data={data}
            options={{
              title: {
                display: true,
                text: 'QUERY LABEL VS RUNTIME (ms)',
                fontSize: 16,
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
  }
}
