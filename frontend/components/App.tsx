import React, { useState } from 'react';
import GlobalStyle from '../GlobalStyle';
// import styled from 'styled-components'
// import {} from '../style-variables'
// import SavedQueries from '../SavedQueries'
import DbList from './sidebar/DbList'


const App = () => {
  // const [queries, setQueries] = useState(new SavedQueries());

  return (
    <>
      <GlobalStyle />
      <DbList />
    </>
  );
};

export default App;
