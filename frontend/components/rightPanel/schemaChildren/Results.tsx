import React, { Component } from 'react';
import { execArgv } from 'process';
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type ResultsProps = {
  queries: {
    queryString: string;
    queryData: object[];
    queryStatistics: any
    querySchema: string;
  }[];
};

export class Results extends Component<ResultsProps> {
  constructor(props: ResultsProps) {
    super(props);
  }

  renderTableData() {
    return this.props.queries.map((query, index) => {
      // destructure state from mainPanel, including destructuring object returned from Postgres
      const { queryString, queryData, queryStatistics, querySchema } = query;
      const { ['QUERY PLAN']: queryPlan } = queryStatistics['items'][0];
      const { Plan, ['Planning Time']: planningTime, ['Execution Time']: executionTime } = queryPlan[0];
      const {
        ['Node Type']: scanType,
        ['Actual Rows']: actualRows,
        ['Actual Startup Time']: actualStartupTime,
        ['Actual Total Time']: actualTotalTime,
        ['Actual Loops']: loops
      } = Plan;

      console.log('planningTime', planningTime);
      console.log('executionTime', executionTime);



      const runtime = ((planningTime + executionTime).toFixed(3));

      return (
        <tr key={index}>
          {/* <td id='label'>{queryLabel}</td> */}
          <td id='query-string'>{queryString}</td>
          <td id='scan-type'>{scanType}</td>
          <td id='runtime'>{runtime}</td>
          {/* <td id='planning-time'>{planningTime}</td>
              <td id='execution-time'>{executionTime}</td>
              <td id='time-fl'>{actualStartupTime}</td>
              <td id='time-al'>{actualTotalTime}</td> */}
          <td id='actual-rows'>{actualRows}</td>
          <td id='loops'>{loops}</td>
          {/* <td id='notes'>{'Notes'}</td> */}
        </tr>
      )
    })
  }

  render() {
    const { queries } = this.props

    return (
      <div style={{ border: '1px solid blue', fontSize: '12px' }}>
        <h2 id='results-title'>Results</h2>
        <table id='results'>
          <tbody>
            <tr style={{ fontWeight: 600 }} id='results-columns'>
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
            {this.renderTableData()}
          </tbody>
        </table>
      </div >
    );
  }
}
