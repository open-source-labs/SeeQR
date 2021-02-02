import React, { Component } from 'react';

type HistoryProps = {
  queries: {
    queryString: string;
    queryData: {}[];
    queryStatistics: any;
    querySchema: string;
    queryLabel: string;
  }[];
};

// Top left panel component displaying previously run queries
class History extends Component<HistoryProps> {
  renderTableHistory() {

    const { queries } = this.props

    return queries.map((query) => {
      const { queryStatistics, querySchema, queryLabel } = query;

      // queryStatistics are the rows returned from running EXPLAIN (FORMAT JSON, ANALYZE).
      // Column containing json representation of plan is called QUERY PLAN
      const { 'QUERY PLAN': queryPlan } = queryStatistics[0];

      const {
        Plan : {'Actual Rows': actualRows, 'Actual Total Time' : actualTotalTime}
        // Plan,
        // 'Planning Time': planningTime,
        // 'Execution Time': executionTime,
      } = queryPlan[0];

      return (
        <tr key={queryLabel}>
          <td id="query-label">{queryLabel}</td>
          <td id="schema-name">{querySchema}</td>
          <td id="actual-rows">{actualRows}</td>
          <td id="total-time">{actualTotalTime}</td>
        </tr>
      );
    });
  }

  render() {
    return (
      <div id="history-panel">
        <h3>History</h3>
        <div className="history-container">
          <table className="scroll-box">
            <tbody>
              <tr className="top-row">
                <td>Query Label</td>
                <td>Schema</td>
                <td>Total Rows</td>
                <td>Total Time</td>
              </tr>
              {this.renderTableHistory()}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default History;
