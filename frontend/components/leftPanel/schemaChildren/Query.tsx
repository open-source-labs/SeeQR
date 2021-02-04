import React, { Component } from 'react';

// Codemirror configuration
import 'codemirror/lib/codemirror.css'; // Styline
import 'codemirror/mode/sql/sql'; // Language (Syntax Highlighting)
import 'codemirror/theme/lesser-dark.css'; // Theme
import CodeMirror from '@skidding/react-codemirror';

// delete before pull request
import DummyDataPanel from './DummyDataPanel';

const { ipcRenderer } = window.require('electron');
const { dialog } = require('electron').remote;

/**
 ****************************************************************
 *********************** TYPESCRIPT: TYPES **********************
 ****************************************************************
*/

type QueryProps = {
  currentSchema: string;
  tableList: string[];
  dbSize: string;
};

type state = {
  queryString: string;
  queryLabel: string;
  // if true, will add query results to the bar chart
  trackQuery: boolean;
};

class Query extends Component<QueryProps, state> {
  constructor(props: QueryProps) {
    super(props);
    this.handleQuerySubmit = this.handleQuerySubmit.bind(this);
    this.updateCode = this.updateCode.bind(this);
    this.handleTrackQuery = this.handleTrackQuery.bind(this);

    this.state = {
      queryString: '',
      queryLabel: '',
      trackQuery: false,
    };
  }

  // Updates state.queryString as user inputs query label
  handleLabelEntry(event: any) {
    this.setState({ queryLabel: event.target.value });
  }

  // Updates state.trackQuery as user checks or unchecks box
  handleTrackQuery(event: any) {
    this.setState({ trackQuery: event.target.checked });
  }

  // Submits query to backend on 'execute-query' channel
  handleQuerySubmit(event: any) {
    event.preventDefault();
    const { currentSchema } = this.props;
    const { queryString, trackQuery, queryLabel } = this.state;
    // if query string is empty, show error
    if (!queryString) {
      dialog.showErrorBox('Please enter a Query.', '');
    }
    if (!trackQuery) {
      // functionality to send query but not return stats and track
      const queryAndSchema = {
        queryString,
        queryCurrentSchema: currentSchema,
        queryLabel,
      };
      ipcRenderer.send('execute-query-untracked', queryAndSchema);
      // reset frontend inputs to display as empty and unchecked
      this.setState({ queryLabel: '', trackQuery: false, queryString: '' });
    }
    if (trackQuery && !queryLabel) {
      dialog.showErrorBox('Please enter a label for the Query.', '');
    } else if (trackQuery) {
      // send query and return stats from explain/analyze
      const queryAndSchema = {
        queryString,
        queryCurrentSchema: currentSchema,
        queryLabel,
      };
      ipcRenderer.send('execute-query-tracked', queryAndSchema);
      // reset frontend inputs to display as empty and unchecked
      this.setState({ queryLabel: '', trackQuery: false, queryString: '' });
    }
  }

  // Updates state.queryString as user inputs query string
  updateCode(newQueryString: string) {
    this.setState({
      queryString: newQueryString,
    });
  }

  render() {
    // Codemirror module configuration options
    const options = {
      lineNumbers: true,
      mode: 'sql',
      theme: 'lesser-dark',
    };

    const { dbSize, tableList, currentSchema } = this.props;
    const { trackQuery, queryLabel, queryString } = this.state;

    return (
      <div id="query-panel">
        <div id="database-info">
          Database Size:
          {dbSize}
        </div>
        <div id="delete-me">
          <DummyDataPanel tableList={tableList} currentSchema={currentSchema} />
        </div>
        <h3>Query</h3>
        <form onSubmit={this.handleQuerySubmit}>
          <div className="query-label">
            <div id="chart-option">
              <span>track on chart:</span>
              <input
                id="track"
                type="checkbox"
                checked={trackQuery}
                onChange={this.handleTrackQuery}
              />
            </div>
            <div id="label-option">
              <label>
                label:
                <input
                  className="label-field"
                  type="text"
                  placeholder="enter label to track"
                  value={queryLabel}
                  onChange={(e) => this.handleLabelEntry(e)}
                />
              </label>
            </div>
          </div>
          <br />
          <h4>Query:</h4>
          <div className="codemirror">
            <CodeMirror
              onChange={this.updateCode}
              options={options}
              value={queryString}
            />
          </div>
          <button type="submit">Submit</button>
          <br />
          <br />
        </form>
      </div>
    );
  }
}

export default Query;
