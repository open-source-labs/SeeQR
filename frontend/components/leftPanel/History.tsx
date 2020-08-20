import React, { Component, MouseEvent } from 'react';
const { ipcRenderer } = window.require('electron');

type ClickEvent = React.MouseEvent<HTMLElement>;

type HistoryProps = {
  queries: {
    queryString: string;
    queryData: object[];
    queryStatistics: any;
    querySchema: string;
  }[];
  currentSchema: string;
};

type HistoryState = {
};

class History extends Component<HistoryProps, HistoryState> {
  render() {
    
    const mappedHistory = this.props.queries.map((el) => {
      const queryLabel = el.queryString;
      const schemaName = el.querySchema;
      const responseTime = el.queryStatistics.items[0]['QUERY PLAN'][0]['Planning Time'] + el.queryStatistics.items[0]['QUERY PLAN'][0]['Execution Time']
      const rows = el.queryStatistics.items[0]['QUERY PLAN'][0].Plan['Plan Rows'];
      return queryLabel+schemaName+responseTime+rows
      }
    )
    return (
      <div id="history-panel" style={{ border: '1px solid blue' }}>
      <h2>History</h2>
      <div id="history-topbar">
        <span className="col-1">Query Label</span>
        <span className="col-2">Schema</span>
        <span className="col-3">Response Time</span>
        <span className="col-4">Rows Returned</span>
      </div>
      <div className="scroll-box">
        <h2>{mappedHistory}</h2>
      </div>
    </div>
  );
};
}

export default History;