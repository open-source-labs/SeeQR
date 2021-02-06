import React, { useState } from 'react';
import GlobalStyle from '../GlobalStyle';
// import styled from 'styled-components'
// import {} from '../style-variables'
import SavedQueries from '../SavedQueries'


const App = () => {
  const [queries, setQueries] = useState(new SavedQueries());

  return (
    <>
      <GlobalStyle />
      <div>Hello</div>
    </>
  );
};

export default App;
