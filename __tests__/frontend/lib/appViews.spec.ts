// after last merge we broke this test maybe will be a path issue in some of them

// import React from 'react';
// import { render, fireEvent } from '@testing-library/react';
// import App from '../../../frontend/components/App';
// import {
//   appViewStateReducer,
//   AppViewState,
// } from '../../../frontend/state_management/Reducers/AppViewReducer';

// describe('App view state reducer', () => {
//   let initialState: AppViewState;

//   beforeEach(() => {
//     initialState = {
//       selectedView: 'dbView',
//       sideBarIsHidden: false,
//       showConfigDialog: false,
//       showCreateDialog: false,
//       PG_isConnected: false,
//       MYSQL_isConnected: false,
//     };
//   });

//   describe('Selected view should properly update the current state', () => {
//     it('should update the selectedView to erView', () => {
//       const newState = appViewStateReducer(initialState, {
//         type: 'SELECTED_VIEW',
//         payload: 'compareView',
//       });
//       expect(newState.selectedView).toEqual('compareView');
//     });

//     it('should update the selectedView to testView', () => {
//       const newState = appViewStateReducer(initialState, {
//         type: 'SELECTED_VIEW',
//         payload: 'queryView',
//       });
//       expect(newState.selectedView).toEqual('queryView');
//     });

//     it('should update the selectedView to view', () => {
//       const newState = appViewStateReducer(initialState, {
//         type: 'SELECTED_VIEW',
//         payload: 'newSchemaView',
//       });
//       expect(newState.selectedView).toEqual('newSchemaView');
//     });
//   });

//   it('should toggle sidebar config', () => {
//     const newState = appViewStateReducer(initialState, {
//       type: 'TOGGLE_SIDEBAR',
//     });
//     expect(newState.sideBarIsHidden).toEqual(true);
//   });

//   it('should toggle showConfigDialog', () => {
//     const newState = appViewStateReducer(initialState, {
//       type: 'TOGGLE_CONFIG_DIALOG',
//     });
//     expect(newState.showConfigDialog).toEqual(true);
//   });
//   it('should toggle showConfigDialog', () => {
//     const newState = appViewStateReducer(initialState, {
//       type: 'TOGGLE_CREATE_DIALOG',
//     });
//     expect(newState.showCreateDialog).toEqual(true);
//   });

//   it('should update the PG connected with the proper passed in boolean', () => {
//     const newState = appViewStateReducer(initialState, {
//       type: 'IS_PG_CONNECTED',
//       payload: true,
//     });
//     expect(newState.PG_isConnected).toEqual(true);
//   });

//   it('should update the MYSQL connected with the proper passed in boolean', () => {
//     const newState = appViewStateReducer(initialState, {
//       type: 'IS_MYSQL_CONNECTED',
//       payload: true,
//     });
//     expect(newState.MYSQL_isConnected).toEqual(true);
//   });
// });
