import React from 'react';

interface TableEntryProps {
  table: string;
  select: () => void;
}

const TableEntry = ({ table, select }: TableEntryProps) => (
  <li onClick={select}>{table}</li>
);

interface TablesSidebarProps {
  tables: string[];
  selectTable: (table: string) => void;
}

const TablesSidebar = ({ tables, selectTable }: TablesSidebarProps) => (
  <>
    <h2>Tables</h2>
    <ul>
      {tables.map((table: string) => (
        <TableEntry
          key={`tablelist_${table}`}
          table={table}
          select={() => selectTable(table)}
        />
      ))}
    </ul>
    <button type="button" onClick={() => console.log('generate dummy data')}>
      Generate Dummy Data
    </button>
  </>
);

export default TablesSidebar;
