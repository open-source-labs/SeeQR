import React, { Component, MouseEvent } from 'react';
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type HistoryProps = {
  queries: {
    queryLabel: string;
    queryStatistics: any;
    querySchema: string;
  }[];
  currentSchema: string;
};

export class History extends Component<HistoryProps> {
  constructor(props: HistoryProps) {
    super(props);
  }

  renderTableHistory() {
    return this.props.queries.map((query, index) => {
      const { queryStatistics, querySchema, queryLabel } = query;

      const { ['QUERY PLAN']: queryPlan } = queryStatistics['items'][0];
      console.log('queryPlan', queryPlan);

      const {
        Plan,
        ['Planning Time']: planningTime,
        ['Execution Time']: executionTime,
      } = queryPlan[0];
      const { ['Actual Rows']: actualRows, ['Actual Total Time']: actualTotalTime } = Plan;

      return (
        <tr key={index}>
          <td id="query-label">{queryLabel}</td>
          <td id="schema-name">{querySchema}</td>
          <td id="actual-rows">{actualRows}</td>
          <td id="total-time">{actualTotalTime}</td>
        </tr>
      );
    });
  }

  render() {
    const { queries } = this.props;
    console.log('queries', queries);

    return (
      <div id="history-panel">
        <h3>History</h3>
        <table className="scroll-box">
          <tbody>
            <tr className="top-row">
              <td>{'Query Label'}</td>
              <td>{'Schema'}</td>
              <td>{'Total Rows'}</td>
              <td>{'Total Time'}</td>
            </tr>
            {this.renderTableHistory()}
          </tbody>
        </table>
      </div>
    );
  }
}

export default History;
