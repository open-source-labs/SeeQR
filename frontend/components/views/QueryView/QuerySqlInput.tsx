/* eslint-disable import/no-extraneous-dependencies */
import React, {useRef, useEffect} from 'react';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import { ButtonGroup, Button, Tooltip, TableRow } from '@mui/material';
import styled from 'styled-components';
import { formatDialect, postgresql } from 'sql-formatter';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution';



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
monaco.editor.defineTheme('sql-theme', {
  base: 'vs-dark',
  inherit: true,
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#d4d4d4',
  },
  rules: [
    { token: 'sql-keyword', foreground: '#828562', fontStyle: 'bold' },
  ],
});

monaco.editor.setTheme('sql-theme');

interface QuerySqlInputProps {
  sql: string;
  onChange: (newSql: string) => void;
  runQuery: () => void;
}

function QuerySqlInput({ sql, onChange, runQuery }: QuerySqlInputProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null> (null)
  
  useEffect(() => {
    const container = document.getElementById('editor-container');

    const initializeEditor = () => {
      if (container && !editorRef.current) {
        editorRef.current = monaco.editor.create(container, {
          value: sql,
          language: 'sql',
          theme: 'sql-theme'
        })
          editorRef.current.onDidChangeModelContent(() => {
          const newSql = editorRef.current?.getValue();
          onChange(newSql || '');
        });
      }
    }
   
    const loaderScript = document.createElement('script');
    loaderScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.22.3/min/vs/loader.min.js';
    loaderScript.async = true;
    loaderScript.onload = initializeEditor;

    document.body.appendChild(loaderScript);

    // return () => {
    //   if (loaderScript.parentNode) {
    //     loaderScript.parentNode.removeChild(loaderScript);
    //   }
    // };

  }, [sql])
  console.log(sql)
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
        <ButtonGroup variant="contained">
          <Tooltip title="Auto-Format Query">
            <SquareBtn onClick={formatQuery}>
              <FormatPaintIcon />
            </SquareBtn>
          </Tooltip>
        </ButtonGroup>
      </Toolbar>
      <div 
        id='editor-container'
        style={{
          width: '100%',
          height: '200px',
        }}
      />
    </Container>
  );
}

export default QuerySqlInput;
