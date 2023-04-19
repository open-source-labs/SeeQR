import React from 'react';
import { Bar, defaults, ChartData } from 'react-chartjs-2';
import styled from 'styled-components'
import { AppState } from '../../../types';
import { getTotalTime } from '../../../lib/queries';
import { compareChartColors, textColor } from '../../../style-variables';

const ChartContainer = styled.div`
  height: 400px;
  width: 100%;
`

defaults.global.defaultFontColor = textColor

/**
 * Builds Chart.js data from queries. Uses isCompared flag on each query to
 * determine which queries to include in comparison
 */
const getChartData = (
  queries: AppState['queries']
): ChartData<Chart.ChartData> => {
  /**
   * Gets next color from defined pallete.
   */
  const getColor = (() => {
    let nextColor = 0;
    return () => {
      // cycle through colors
      const color = compareChartColors[nextColor % compareChartColors.length];
      nextColor += 1;
      return color;
    };
  })();

 

  const comparedQueries = Object.values(queries);

  // unique query labels
  const uniqueLabels = [...new Set(comparedQueries.map((query) => `label:${query.label} db:${query.db} group:${query.group}`))];
  const labels = [...new Set(comparedQueries.map((query) => query.group))];

  // unique dbs in comparison
  const comparedDbs = [...new Set(comparedQueries.map((query) => query.db))];

  // Algorithm for grouping speeds by group
  const groups:object = {};
  for (let i = 0; i < uniqueLabels.length; i++) {
    if (groups[queries[uniqueLabels[i]].db]) {
      groups[queries[uniqueLabels[i]].db].push(uniqueLabels[i]);
    } else {
      groups[queries[uniqueLabels[i]].db] = [uniqueLabels[i]];
    };
  };
  // array of objects representing each database that is being displayed
  const datasets = comparedDbs.map((db) => {
    const color = getColor();
    return {
      label: db,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
      // array with values for each group. If group doesn't have a query with a
      // given label being compared, set it's value to
      data: groups[db].map((label) => getTotalTime(queries[label])),
    };
  });
  return { labels, datasets };
};

interface CompareChartProps {
  queries: AppState['queries'];
}

const CompareChart = ({ queries }: CompareChartProps) => (
  <ChartContainer>
    <Bar
      data={getChartData(queries)}
      options={{

        title: {
          display: true,
          text: 'QUERY GROUP VS RUNTIME (ms)',
          fontSize: 16,
        },
        legend: {
          display: true,
          position: 'right',
        },
        scales: {
          yAxes: [{
            ticks: {
            beginAtZero: true
          }
          }],
        },
        maintainAspectRatio: false,

      }}
    />
  </ChartContainer>
);

export default CompareChart;

