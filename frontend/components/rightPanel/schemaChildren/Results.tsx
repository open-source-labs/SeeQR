import React, { Component } from 'react';

type ResultsProps = {
  // queries: {
  //   queryString: string;
  //   queryData: string;
  //   queryStatistics: any
  //   querySchema: string;
  // }[];
  queries: any;
};

export class Results extends Component<ResultsProps> {
  constructor(props: ResultsProps) {
    super(props);
  }

  renderTableData() {
    return this.props.queries.map((query, index) => {
      // destructure state from mainPanel, including destructuring object returned from Postgres
      const { queryString, queryData, queryStatistics, querySchema } = query;
      const { ['QUERY PLAN']: queryPlan } = queryStatistics['items'];
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
          {/* <td id='label'>{queryLabel}</td> */}
          <td id="query-string">{queryString}</td>
          <td id="scan-type">{scanType}</td>
          <td id="runtime">{runtime}</td>
          {/* <td id='planning-time'>{planningTime}</td>
              <td id='execution-time'>{executionTime}</td>
              <td id='time-fl'>{actualStartupTime}</td>
              <td id='time-al'>{actualTotalTime}</td> */}
          <td id="actual-rows">{actualRows}</td>
          <td id="loops">{loops}</td>
          {/* <td id='notes'>{'Notes'}</td> */}
        </tr>
      );
    });
  }

  render() {
    const { queries } = this.props;

    return (
      <div id="results-panel">
        <h3>Results</h3>
        <table id="results">
          <tbody>
            <tr className="top-row">
              {/* <td>{'Label'}</td> */}
              <td>{'Query'}</td>
              <td>{'Scan Type'}</td>
              <td>{'Runtime (ms)'}</td>
              {/* <td>{'Planning Time'}</td>
              <td>{'Execution Time'}</td>
              <td>{'Time: First Line (ms)'}</td>
              <td>{'Time: All Lines (ms)'}</td> */}
              <td>{'Returned Rows'}</td>
              <td>{'Loops'}</td>
              {/* <td>{'Notes'}</td> */}
            </tr>
            {/* {this.renderTableData()} */}
          </tbody>
        </table>
      </div>
    );
  }
}
