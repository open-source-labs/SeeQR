// import { createContext, useState, useCallback, useMemo } from 'react';

// const selectedDbContext = createContext(null);
// const ERViewContext = createContext(null);
// const curDBTypeContext = createContext(null);
// const DBInfoContext = createContext(null);
// const dbTablesContext = createContext(null);
// const selectedTableContext = createContext(null);

// const CurrentUserContext = createContext(null);
// selectedDb = { selectedDb };
// setERView = { setERView };
// ERView = { ERView };
// curDBType = { curDBType };
// setDBType = { setDBType };
// DBInfo = { DBInfo };
// setDBInfo = { setDBInfo };
// dbTables = { dbTables };
// setTables = { setTables };
// selectedTable = { selectedTable };
// setSelectedTable = { setSelectedTable };
// function MyProviders({ children, theme, setTheme }) {
//   const [currentUser, setCurrentUser] = useState(null);
//   return (
//     <ThemeContext.Provider value={theme}>
//       <CurrentUserContext.Provider
//         value={{
//           currentUser,
//           setCurrentUser,
//         }}
//       >
//         {children}
//       </CurrentUserContext.Provider>
//     </ThemeContext.Provider>
//   );
// }

// function MyApp() {
//   const [currentUser, setCurrentUser] = useState(null);

//   const login = useCallback((response) => {
//     storeCredentials(response.credentials);
//     setCurrentUser(response.user);
//   }, []);

//   const contextValue = useMemo(
//     () => ({
//       currentUser,
//       login,
//     }),
//     [currentUser, login]
//   );

//   return (
//     <AuthContext.Provider value={contextValue}>
//       <Page />
//     </AuthContext.Provider>
//   );
// }
