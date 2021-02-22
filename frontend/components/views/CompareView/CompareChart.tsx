import React from 'react';
import { Bar, defaults, ChartData } from 'react-chartjs-2';
import styled from 'styled-components'
import { AppState } from '../../../types';
import { keyFromData, getTotalTime } from '../../../lib/queries';
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
      data: labels.map((label) =>
        getTotalTime(queries[keyFromData(label, db)])
      ),
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
  </ChartContainer>
);

export default CompareChart;
