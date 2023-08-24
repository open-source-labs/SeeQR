import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

interface Row {
  [key: string]: string | number | boolean | object;
}

interface ClickedNodeDetailProps {
  returnedRows: Row[];
  selectedNode: string;
}

const StyledTableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 5px ridge rgb(3, 45, 67);
`;

const StyledTable = styled.table`
  min-width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  margin: 3px;
`;

const StyledTh = styled.th<{ isSelected: boolean }>`
  position: relative;
  width: 100px;
  border: 1px solid #555;
  background-color: rgb(0, 10, 30);
  color: #fff;
  padding: 8px;
  cursor: pointer;
  font-size: 16px;

  > div {
    width: 100%;
    height: 100%;
    overflow: hidden;
    resize: horizontal;
    padding-right: 16px;
    box-sizing: border-box;
  }

  ${({ isSelected }) => isSelected
    && css`
      border-left: 3px solid transparent;
      border-right: 3px solid transparent;
      animation: borderAnimation 2s infinite alternate;
    `}

  @keyframes borderAnimation {
    0% {
      border-left-color: rgb(255, 255, 255);
      border-right-color: rgb(255, 255, 255);
      border-top-color: rgb(255, 255, 255);
      background-color: rgba(255, 255, 255, 0.05);
    }
    100% {
      border-left-color: rgb(0, 0, 20);
      border-right-color: rgb(0, 0, 20);
      border-top-color: rgb(0, 0, 20);
      background-color: rgb(0, 0, 20);
    }
  }
`;

const StyledTd = styled.td<{ isSelected: boolean }>`
  border: 1px solid #555;
  padding: 5px 8px;
  font-size: 15px;

  ${({ isSelected }) => isSelected
    && css`
      border-left: 3px solid transparent;
      border-right: 3px solid transparent;
      animation: borderAnimation2 2s infinite alternate;
    `}

  @keyframes borderAnimation2 {
    0% {
      border-left-color: rgb(255, 255, 255);
      border-right-color: rgb(255, 255, 255);
      border-bottom-color: rgb(255, 255, 255);
      background-color: rgba(255, 255, 255, 0.05);
    }
    100% {
      border-left-color: rgb(0, 0, 20);
      border-right-color: rgb(0, 0, 20);
      border-bottom-color: rgb(0, 0, 20);
    }
  }
`;

const ClickedNodeDetail: React.FC<ClickedNodeDetailProps> = ({ returnedRows, selectedNode }) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleColumnClick = (column: string) => {
    if (sortColumn === column) {
      // Toggle sort direction if the same column is clicked
      setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      // Sort by the clicked column in ascending order by default
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedRows = [...returnedRows];
  if (sortColumn) {
    sortedRows.sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];
      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  const columns = Object.keys(returnedRows[0]);

  return (
    <StyledTableWrapper>
      <StyledTable>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <StyledTh
                key={index}
                onClick={() => handleColumnClick(column)}
                isSelected={column === selectedNode}
              >
                <div>{column}</div>
              </StyledTh>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, columnIndex) => {
                const cellValue = JSON.stringify(row[column]);
                const formattedValue = cellValue[0] === '"' && cellValue[cellValue.length - 1] === '"'
                  ? cellValue.slice(1, -1)
                  : cellValue;
                return (
                  <StyledTd key={columnIndex} isSelected={column === selectedNode}>
                    {formattedValue}
                  </StyledTd>
                );
              })}
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledTableWrapper>
  );
};

export default ClickedNodeDetail;
