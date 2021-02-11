import React from 'react';
import { Bar, defaults, ChartData } from 'react-chartjs-2';
import { AppState } from '../../../types';
import {keyFromData, getTotalTime} from '../../../lib/queries'

// TODO: connect to our variables
defaults.global.defaultFontColor = 'rgb(198,210,213)';

/**
 * Gets next color from defined pallete.
 */
const getColor = (() => {
  let nextColor = 0;
  const colorList = [
    '#006C67',
    '#F194B4',
    '#FFB100',
    '#FFEBC6',
    '#A4036F',
    '#048BA8',
    '#16DB93',
    '#EFEA5A',
    '#F29E4C',
  ];
  return () => {
    // cycle through colors
    const color = colorList[nextColor % colorList.length];
    nextColor += 1;
    return color;
  };
})();

/**
 * Builds Chart.js data from queries. Uses isCompared flag on each query to
 * determine which queries to include in comparison
 */
const getChartData = (queries: AppState['queries']): ChartData<Chart.ChartData> => {
  const comparedQueries = Object.values(queries)

  // unique query labels
  const labels = [...new Set(comparedQueries.map((query) => query.label))];

  // unique dbs in comparison
  const comparedDbs = [...new Set(comparedQueries.map((query) => query.db))];

  // array of objects representing each database that is being displayed
  const datasets = comparedDbs.map((db) => {
    const color = getColor();
    return {
      label: db,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
      // array with values for each label. If db doesn't have a query with a
      // given label being compared, set it's value to 
      data: labels.map((label) => getTotalTime(queries[keyFromData(label, db)])),
    };
  });

  return { labels, datasets };
};

interface CompareChartProps {
  queries: AppState['queries'];
}

const CompareChart = ({ queries }: CompareChartProps) => (
  <>
    <Bar
      data={getChartData(queries)}
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
  </>
);

export default CompareChart;
