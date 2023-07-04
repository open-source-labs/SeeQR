import React from 'react';

const ClickedNodeDetail = ({ returnedRows }) => {
    console.log('returnreturnrworworworworworw',returnedRows)
  const columns = Object.keys(returnedRows[0]); // Extract property names from the first object in the array

  return (
    <table style={{ width: '800px' }}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody align="center">
        {returnedRows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, columnIndex) => (
              <td key={columnIndex}>{JSON.stringify(row[column])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClickedNodeDetail;

