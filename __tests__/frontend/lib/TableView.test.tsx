global.TextEncoder = require('util').TextEncoder;

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import TablesTabs from '../../../frontend/components/views/DbView/TablesTabBar';
import { DBType } from '../../../backend/BE_types';
import { TableInfo, TableColumn, AppState } from '../../../frontend/types';
import '@testing-library/jest-dom';

const setERViewMock = jest.fn();
const selectTableMock = jest.fn();

test('', ()=> {

})

test('testing rendering of TablesTabs', () => {
  let active = false;
  const tables = [
    {
      table_catalog: 'test',
      table_schema: 'public',
      table_name: 'newtable1',
      is_insertable_into: 'yes',
      columns: [
        {
          column_name: 'newcolumn1',
          data_type: 'character varying',
          character_maximum_length: 255,
          is_nullable: 'YES',
          //   constraint_name: null,
          //   constraint_type: null,
          //   foreign_table: null,
          //   foreign_column: null,
        },
        {
          column_name: 'newcolumn2',
          data_type: 'character varying',
          character_maximum_length: 255,
          is_nullable: 'YES',
          //   constraint_name: null,
          //   constraint_type: null,
          //   foreign_table: null,
          //   foreign_column: null,
        },
      ] as TableColumn[],
    },
    {
      table_catalog: 'test',
      table_schema: 'public',
      table_name: 'newtable2',
      is_insertable_into: 'YES',
      columns: [
        {
          column_name: 'newcolumn1',
          data_type: 'character varying',
          character_maximum_length: 255,
          is_nullable: 'YES',
          //   constraint_name: null,
          //   constraint_type: null,
          //   foreign_table: null,
          //   foreign_column: null,
        },
      ],
    },
  ] as TableInfo[];

  let selectedTable = {
    table_catalog: 'test',
    table_schema: 'public',
    table_name: 'newtable2',
    is_insertable_into: 'YES',
    columns: [
      {
        column_name: 'newcolumn1',
        data_type: 'character varying',
        character_maximum_length: 255,
        is_nullable: 'YES',
        constraint_name: null,
        constraint_type: null,
        foreign_table: null,
        foreign_column: null,
      },
    ],
  };

  render(
    <TablesTabs
      tables={tables}
      selectedTable={selectedTable as TableInfo}
      curDBType={'pg' as DBType}
      setERView={setERViewMock}
      selectTable={selectTableMock}
      selectedDb={'test' as AppState['selectedDb']}
    />,
  );
  const tableName = screen.getByText('newtable1');
  expect(tableName).toBeInTheDocument();
});
