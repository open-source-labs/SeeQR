import React from 'react';

import 'codemirror/lib/codemirror.css'; // Styline
import 'codemirror/mode/sql/sql'; // Language (Syntax Highlighting)
import 'codemirror/theme/lesser-dark.css'; // Theme
import CodeMirror from '@skidding/react-codemirror';

interface QuerySqlInputProps {
  sql: string;
  onChange: (newSql: string) => void
}

// Codemirror module configuration options
const options = {
  lineNumbers: true,
  mode: 'sql',
  theme: 'lesser-dark',
};

const QuerySqlInput = ({ sql, onChange }: QuerySqlInputProps) => (
  <CodeMirror
    onChange={onChange}
    options={options}
    value={sql}
  />
);

export default QuerySqlInput;
