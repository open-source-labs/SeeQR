/* eslint-disable import/no-extraneous-dependencies */
import React, { useRef, useEffect, useState } from 'react';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import { ButtonGroup, Button, Tooltip } from '@mui/material';
import styled from 'styled-components';
import { formatDialect, postgresql } from 'sql-formatter';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution';
import QueryHistory from './QueryHistory';
import { exists } from 'fs';

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
  rules: [{ token: 'sql-keyword', foreground: '#828562', fontStyle: 'bold' }],
});

monaco.editor.setTheme('sql-theme');

interface QuerySqlInputProps {
  sql: string;
  onChange: (newSql: string) => void;
}

function QuerySqlInput({ sql, onChange }: QuerySqlInputProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
 
  useEffect(() => {
    const container = document.getElementById('editor-container');
    if(editorRef.current) {
      // model will just be an obj
      const model = editorRef.current.getModel();
      // get the value in sql 
      const currentSql = model?.getValue();
      // checks if the currentSql is not sql then we will reassign the model value to sql
      if(currentSql !== sql) {
        model?.setValue(sql)
      }
    }
    
    const initializeEditor = () => {
      // console.log('sql', sql)
      if (container && !editorRef.current) {
        editorRef.current = monaco.editor.create(container, {
          value: sql,
          language: 'sql',
          theme: 'sql-theme',
        });

        editorRef.current.onDidChangeModelContent(() => {
          const newSql = editorRef.current?.getValue();
          onChange(newSql || '');
        });
      }
    };

    const loaderScript = document.createElement('script');
    loaderScript.src =
      'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.22.3/min/vs/loader.min.js';
    loaderScript.async = true;
    loaderScript.onload = initializeEditor;

    document.body.appendChild(loaderScript);
  });

  const formatQuery = () => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      console.log(model);
      if (model) {
        // Get the current content of the editor
        const content = model.getValue();
        // Format the SQL query using the formatting provider
        const formatted = formatDialect(content, {
          dialect: postgresql,
          keywordCase: 'upper',
        });
        // Apply the formatted content back to the editor
        monaco.editor.setModelLanguage(model, 'sql');
        model.setValue(formatted);
        // Update the parent component's state with the formatted query
        onChange(formatted);
      }
    }
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
        id="editor-container"
        style={{
          width: '100%',
          height: '300px',
        }}
      />
    </Container>
  );
}

export default QuerySqlInput;
