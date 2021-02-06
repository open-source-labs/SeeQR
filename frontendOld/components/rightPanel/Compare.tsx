import React, { useState } from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { Bar, defaults } from 'react-chartjs-2';

defaults.global.defaultFontColor = 'rgb(198,210,213)';

type Query = {
  queryString: string;
  queryData: {}[];
  queryStatistics: any;
  querySchema: string;
  queryLabel: string;
};

type CompareProps = {
  queries: Query[];
};

// -------------------------------------------------------------------------------------------------------------
// ------------------------------------ logic for setting state --------------------------------------------
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

const Compare = (props: CompareProps) => {
  const [compareList, setCompareList] = useState<Query[]>([]);

  const addCompareQuery = (event) => {
    // compare list is a dropdown menu on the front-end
    const newCompareList = [...compareList];
    props.queries.forEach((query) => {
      // if the query is clicked in the dropdown menu
      if (query.queryLabel === event.target.text) {
        // only allow the addition of queries that aren't already being compared
        if (!newCompareList.includes(query)) {
          newCompareList.push(query);
        }
      }
    });
    // reset state to account for the change in queries being tracked
    setCompareList(newCompareList);
  };

  // -------------------------------------------------------------------------------------------------------------
  // ------------------------------------ logic for the compare query table --------------------------------------
  // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

  const deleteCompareQuery = (event) => {
    // reset comparelist so that the query that is chosen is not included any more
    setCompareList(
      compareList.filter(({ queryLabel }) => queryLabel !== event.target.id)
    );
  };

  const dropDownList = () =>
    // for each query on the query list, make a dropdown item in the menu
    props.queries.map(({ queryLabel }) => (
      <Dropdown.Item
        key={queryLabel}
        className="queryItem"
        onClick={addCompareQuery}
      >
        {queryLabel}
      </Dropdown.Item>
    ));

  // Rendering the compare table with selected queries from dropdown list
  const renderCompare = () =>
    compareList.map(({ queryLabel, querySchema, queryStatistics }) => {
      const { 'QUERY PLAN': queryPlan } = queryStatistics[0];

      const {
        Plan,
        'Planning Time': planningTime,
        'Execution Time': executionTime,
      } = queryPlan[0];

      const { 'Actual Rows': actualRows } = Plan;

      return (
        <tr key={queryLabel}>
          <td id="label">{queryLabel}</td>
          <td id="schema-name">{querySchema}</td>
          <td id="actual-rows">{actualRows}</td>
          <td id="planning-time">{planningTime}</td>
          <td id="execution-time">{executionTime}</td>
          <td>
            <button
              id={queryLabel}
              type="button"
              className="delete-query-button"
              onClick={deleteCompareQuery}
            >
              X
            </button>
          </td>
        </tr>
      );
    });

  // -------------------------------------------------------------------------------------------------------------
  // ------------------------------------ logic for the compare query graph --------------------------------------
  // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

  // calculate total run time of query
  const getTotalRuntime = (queryStatistics): number =>
    queryStatistics[0]['QUERY PLAN'][0]['Execution Time'] +
    queryStatistics[0]['QUERY PLAN'][0]['Planning Time'];

  const generateDatasets = () => {
    // first we create an object with all of the comparelist data organized in a way that enables us to render our graph easily
    const compareDataObject: any = {};

    // then we populate that object
    compareList.forEach(({ queryLabel, querySchema, queryStatistics }) => {
      if (!compareDataObject[querySchema]) compareDataObject[querySchema] = {};

      compareDataObject[querySchema][queryLabel.toString()] = getTotalRuntime(
        queryStatistics
      );
    });

    // then we generate a labelData array to store all unique query labels
    const labelDataArray: any = [];
    for (const schema in compareDataObject) {
      for (const label in compareDataObject[schema]) {
        if (!labelDataArray.includes(label)) {
          labelDataArray.push(label);
        }
      }
    }

    // then we generate an array of data for each schema, storing data for each unique query according to the schema
    const runTimeDataArray: any = [];
    for (const schema in compareDataObject) {
      const schemaArray: any = [];
      for (const label of labelDataArray) {
        schemaArray.push(
          compareDataObject[schema][label]
            ? compareDataObject[schema][label]
            : 0
        );
      }
      runTimeDataArray.push({ [schema]: schemaArray });
    }

    // creating a list of possible colors for the graph
    const schemaColors = {
      nextColor: 0,
      colorList: [
        '#006C67',
        '#F194B4',
        '#FFB100',
        '#FFEBC6',
        '#A4036F',
        '#048BA8',
        '#16DB93',
        '#EFEA5A',
        '#F29E4C',
      ],
    };

    // then we generate datasets for each schema for the bar chart
    const datasets = runTimeDataArray.map((schemaDataObject) => {
      const schemaLabel: any = Object.keys(schemaDataObject)[0];
      const color =
        schemaColors.colorList[
          schemaColors.nextColor % schemaColors.colorList.length
        ];
      schemaColors.nextColor += 1;
      return {
        label: `${schemaLabel}`,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        data: schemaDataObject[schemaLabel],
      };
    });

    // then we combine the label array and the data arrays for each schema into a data object to pass to our bar graph
    return {
      // labels per index
      labels: labelDataArray,
      // chartjs datasets with values in data key, following order of above labels array
      datasets,
    };
  };

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
              <td>Query Label</td>
              <td>Schema</td>
              <td>Total Rows</td>
              <td>Planning</td>
              <td>Execution</td>
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
              fontSize: 16,
            },
            legend: {
              display: true,
              position: 'right',
            },
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
};

export default Compare;
