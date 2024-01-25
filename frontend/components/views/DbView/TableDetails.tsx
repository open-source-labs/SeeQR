import { ipcRenderer } from 'electron';
import React from 'react';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@mui/material';
import styled from 'styled-components';
import { greyDark, greyPrimary } from '../../../style-variables';
import { TableInfo } from '../../../types';
import { DBType } from '../../../../backend/BE_types';

const StyledPaper = styled(({ ...other }) => (
  <Paper elevation={8} {...other} />
))`
  background: ${greyDark};
`;

const StyledCell = styled(TableCell)`
  border-bottom: 1px solid ${greyPrimary};
`;

interface TableDetailsProps {
  table: TableInfo | undefined;
  selectedDb: string;
  curDBType: DBType | undefined;
}

// SELECT * FROM table.table_name
function TableDetails({ table, selectedDb, curDBType }: TableDetailsProps) {
  const [data,setData] = useState([])
  const onDisplay = () => {
    ipcRenderer
      .invoke(
        'run-select-all-query',
        {
          sqlString: `SELECT * FROM ${table?.table_name}`,
          selectedDb,
        },
        curDBType,
      )
      .then((data) => {
        setData(data)
      })
      .catch((err) => {
        console.error('Error in onDisplay ', err);
      });
  };

  useEffect(() => {
    onDisplay();
  }, [table, selectedDb, curDBType]);

  // console.log(data, 'testing this log')

  // : 
  // {newcolumn1: 'a8i984ia03ykuqko7x08v2hxbdb3pxl3ux9ybq8', newcolumn2: 'eqb30oxyy2bjqt8rpu58v9wg4mnsrzn2gfnjcha6m8rj87rgt8…ng9lioea6p264jhhdhwyzp5ezduro962pl334pocgrri6vy1s'}
  // 1
  // : 
  // {newcolumn1: 'irr1n5zvtjz8xfwc8v7l8m7kdqrxjkbtxgjg9duzs06nuhkeatab3x4du4kuh1rs7f3wh5xz9', newcolumn2: '8zanfti4nz7g2aoxs1ky3fjxlstp21egsf9qxcthrl95b2j41y…yt4w0vq4hs6k4trzrl7ish9nnqwlcdrvqpjf7luu03z8y0o50'}
  // 2
  // : 
  // {newcolumn1: 'd4fnqeaxlo8jrikw80wszygbjpnyxokf0teqqx22xftyfansr1…0sihdnu3tuzwfjsvadxtm1rp8bdn78s2x2dxvs460k6y8bwwj', newcolumn2: 'olg2awxoo4zpdli72d9rwr2vehy0wq8z71uu3kgilopqogdhsk…pmhseyx87it8jc42x4cz9qbvp8arr8olo3nv4hjiagquf9vbz'}
  // 3
  // : 
  // {newcolumn1: '0faxbzdgrn2jppmz9wh54ej0et1bv6jg4yvglv2chqtjyf', newcolumn2: 'has194y0zf1yhg4lfkewgjtruqc24zska4ytpfavporopz9trq…511oiynbp06peqe3xnn2j484rp2gukyd0e66ercnygufg6k3y'}
  // length
  // : 
  // 4
  
  return (
    <>
      <Typography variant="h3">{`${table?.table_name}`}</Typography>
      <br />
      <TableContainer component={StyledPaper}>
        <Table>
          <TableHead>
            <TableRow>
                {table?.columns.map((row) => (
              <TableCell>
                  {`${row?.column_name} (${row?.data_type} ${row.character_maximum_length})`}
              </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((element) => (
              <TableRow>
                {Object.keys(element).map((column) => (
                  <TableCell key={element}>
                    {element[column]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
{/* <TableCell>
                {table?.columns.map((row) => (
                  <StyledCell key={row?.column_name}>
                    {`${row?.column_name} (${row?.data_type}${
                      row?.character_maximum_length
                        ? `(${row.character_maximum_length})`
                        : ''
                    }) `}
                  </StyledCell>
                  ))}
              </TableCell> */}
{/* <TableBody>
          {table?.columns.map((row) => (
            <TableRow key={row.column_name}>
              <StyledCell key={row?.column_name}>{row?.column_name}</StyledCell>
              <StyledCell align="right">
                {`${row?.data_type}${
                  row?.character_maximum_length
                    ? `(${row.character_maximum_length})`
                    : ''
                }`}
              </StyledCell>
              <StyledCell align="right">{row?.is_nullable}</StyledCell>
            </TableRow>
          ))}
        </TableBody> */}




export default TableDetails;
