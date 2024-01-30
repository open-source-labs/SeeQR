/* eslint-disable import/no-extraneous-dependencies */
import React, { useRef, useEffect, useState } from 'react';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import { ButtonGroup, Button, Tooltip } from '@mui/material';
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
  rules: [{ token: 'sql-keyword', foreground: '#828562', fontStyle: 'bold' }],
});

monaco.editor.setTheme('sql-theme');

interface QuerySqlInputProps {
  sql: string;
  onChange: (newSql: string) => void;
}

function QuerySqlInput({ sql, onChange, runQuery }: QuerySqlInputProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  // const [currentSql, setCurrentSql] = useState(sql)
  useEffect(() => {
    console.log(sql);
    const container = document.getElementById('editor-container');
    const initializeEditor = () => {
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
      // } else if (editorRef.current) {
      //   editorRef.current.setValue(sql);
      // }
    };

    const loaderScript = document.createElement('script');
    loaderScript.src =
      'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.22.3/min/vs/loader.min.js';
    loaderScript.async = true;
    loaderScript.onload = initializeEditor;

    document.body.appendChild(loaderScript);
  }, [sql, onChange]);

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

// ... other imports and code ...
// ... other imports and code ...

// function QuerySqlInput({ sql, onChange, runQuery }: QuerySqlInputProps) {
//   const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
//   const [userChangedValue, setUserChangedValue] = useState(false);

//   useEffect(() => {
//     const container = document.getElementById('editor-container');

//     const initializeEditor = () => {
//       if (container && !editorRef.current) {
//         editorRef.current = monaco.editor.create(container, {
//           value: sql,
//           language: 'sql',
//           theme: 'sql-theme',
//         });

//         editorRef.current.onDidChangeModelContent(() => {
//           const newSql = editorRef.current?.getValue();
//           if (userChangedValue) {
//             onChange(newSql || '');
//           } else {
//             setUserChangedValue(true);
//           }
//         });

//         // Set focus and cursor at the end of the editor after initialization
//         const lastLine = editorRef.current.getModel()?.getLineCount() || 1;
//         const lastColumn = editorRef.current.getModel()?.getLineMaxColumn(lastLine) || 1;
//         editorRef.current.setSelection(new monaco.Selection(lastLine, lastColumn, lastLine, lastColumn));
//       } else if (editorRef.current && sql !== editorRef.current.getValue()) {
//         // Update the value when the sql prop changes
//         const currentPosition = editorRef.current.getPosition();
//         editorRef.current.setValue(sql);
//         setUserChangedValue(false);

//         // Set the cursor to the previous position or at the end if it was at the end
//         if (currentPosition) {
//           const lastLine = editorRef.current.getModel()?.getLineCount() || 1;
//           const lastColumn = editorRef.current.getModel()?.getLineMaxColumn(lastLine) || 1;
//           editorRef.current.setPosition(new monaco.Position(
//             currentPosition.lineNumber <= lastLine ? currentPosition.lineNumber : lastLine,
//             currentPosition.column <= lastColumn ? currentPosition.column : lastColumn
//           ));
//         }
//       }
//     };

//     const loaderScript = document.createElement('script');
//     loaderScript.src =
//       'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.22.3/min/vs/loader.min.js';
//     loaderScript.async = true;
//     loaderScript.onload = initializeEditor;

//     document.body.appendChild(loaderScript);

//     return () => {
//       // Cleanup function to dispose of the editor when the component unmounts
//       if (editorRef.current) {
//         editorRef.current.dispose();
//         editorRef.current = null;
//       }
//     };
//   }, [sql, onChange, userChangedValue]);

//   const formatQuery = () => {
//     const formatted = formatDialect(sql, {
//       dialect: postgresql,
//       keywordCase: 'upper',
//     });
//     onChange(formatted);
//     setUserChangedValue(true);

//     // Set focus and cursor at the end of the editor after calling onChange
//     if (editorRef.current) {
//       const lastLine = editorRef.current.getModel()?.getLineCount() || 1;
//       const lastColumn = editorRef.current.getModel()?.getLineMaxColumn(lastLine) || 1;
//       editorRef.current.setSelection(new monaco.Selection(lastLine, lastColumn, lastLine, lastColumn));
//       editorRef.current.focus();
//     }
//   };

//   return (
//     <Container>
//       <Toolbar>
//         <ButtonGroup variant="contained">
//           <Tooltip title="Auto-Format Query">
//             <SquareBtn onClick={formatQuery}>
//               <FormatPaintIcon />
//             </SquareBtn>
//           </Tooltip>
//         </ButtonGroup>
//       </Toolbar>
//       <div
//         id="editor-container"
//         style={{
//           width: '100%',
//           height: '300px',
//         }}
//       />
//     </Container>
//   );
// }

// export default QuerySqlInput;
