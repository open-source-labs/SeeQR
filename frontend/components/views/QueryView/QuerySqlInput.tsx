/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import { ButtonGroup, Button, Tooltip } from '@mui/material';
import styled from 'styled-components';
import { formatDialect, postgresql } from 'sql-formatter';
import CodeMirror from '@uiw/react-codemirror';
import { dracula } from '@uiw/codemirror-theme-dracula';

const Container = styled.div`
  position: relative;
`;

const SquareBtn = styled(Button)`
  padding: 5px;
`;

const Toolbar = styled.div`
  position: absolute;
  z-index: 1000;
  top: 5px;
  right: 23px;
  opacity: 0.3;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

interface QuerySqlInputProps {
  sql: string;
  onChange: (newSql: string) => void;
  runQuery: () => void;
}

function QuerySqlInput({ sql, onChange, runQuery }: QuerySqlInputProps) {
  const formatQuery = () => {
    const formatted = formatDialect(sql, {
      dialect: postgresql,
      keywordCase: 'upper',
      
    });
    onChange(formatted);
  };

  return (
    <Container>
      <Toolbar>
        <ButtonGroup variant="contained" >
          <Tooltip title="Auto-Format Query" >
            <SquareBtn onClick={formatQuery} >
              <FormatPaintIcon />
            </SquareBtn>
          </Tooltip>
        </ButtonGroup>
      </Toolbar>
      <CodeMirror
        onChange={onChange}
        theme={dracula}
        style={{border:"1px solid white"}}
        height="300px"
        value={sql}
        basicSetup={{
          highlightActiveLine: true,
          highlightSpecialChars: true,
        }}
      
      />
    </Container>
  );
}

export default QuerySqlInput;
