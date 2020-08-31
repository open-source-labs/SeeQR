import React, { Component } from 'react';
import { Compare } from './leftPanel/Compare';
import History from './leftPanel/History';
import { SchemaContainer } from './rightPanel/SchemaContainer';
const { ipcRenderer } = window.require('electron');
type MainState = {
  // queries: {
  //   queryString: string;
  //   queryData: string;
  //   queryStatistics: any
  //   querySchema: string;
  // }[];
  queries: any;
  currentSchema: string;
  // queryLabel: string;
  dbLists: any;
};
type MainProps = {};
// interface MainState {
//   queries: any;
//   currentSchema: string;
// }
class MainPanel extends Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
  }
  state: MainState = {
    queries: [],
    // currentSchema will change depending on which Schema Tab user selects
    currentSchema: 'schemaB',
    dbLists: {}
  };
  render() {
    // Listening for returnedData from executing Query
    // Update state with new object (containing query data, query statistics, query schema
    // inside of state.queries array
    ipcRenderer.on('return-execute-query', (event: any, returnedData: any) => {
      console.log('returnedData', returnedData);
      // destructure from returnedData from backend
      const { queryString, queryData, queryStatistics, queryCurrentSchema, queryLabel } = returnedData;
      // create new query object with returnedData
      const newQuery = {
        queryString,
        queryData,
        queryStatistics,
        querySchema: queryCurrentSchema,
        queryLabel,
      }
      // create copy of current queries array
      let queries = this.state.queries.slice();
      // push new query object into copy of queries array
      queries.push(newQuery)
      this.setState({ queries })
      console.log('state after receiving data: ', this.state);
    });
    ipcRenderer.on('db-lists', (event: any, returnedLists: any) => {
      this.setState({dbLists: returnedLists})
      console.log("In MainPanel, lists:", returnedLists)
    })
    return (
      <div id="main-panel">
        <div id="main-left">
          <History queries={this.state.queries} currentSchema={this.state.currentSchema} />
          <Compare />
        </div>
        <SchemaContainer queries={this.state.queries} currentSchema={this.state.currentSchema} />
      </div>
    );
  }
}
export default MainPanel;


// Mock Data for State
// class MainPanel extends Component<MainProps, MainState> {
//   constructor(props: MainProps) {
//     super(props);
//   }

//   state: MainState = {
//     queries: [
//       {
//         queryString: 'SELECT * FROM public.items',
//         queryData:
//           [
//             {
//               _id: 1,
//               title: 'fiddle leaf fig',
//               description: 'lovely green addition to your home',
//               image:
//                 'https://cdn.shopify.com/s/files/1/0013/3529/6118/products/Kent-48-3265.048-WH_Fiddle-Leaf-Fig-Tree-14.jpg?v=1590447682',
//               category: 'home goods',
//               status: false,
//               user_id: '1',
//               item_latitude: '37.4224764',
//               item_longitude: '-122.0842499',
//             },
//             {
//               _id: 2,
//               title: 'monstera leaf',
//               description: 'lovely green addition to your home',
//               image:
//                 'https://cdn.shopify.com/s/files/1/0150/6262/products/the-sill_monstera_variant_medium_grant_cream_54108884-3d3d-44f4-9c34-d741345067ab_1200x.jpg?v=1589821773',
//               category: 'home goods',
//               status: false,
//               user_id: '1',
//               item_latitude: '37.4224764',
//               item_longitude: '-122.0842499',
//             },
//           ],
//         queryStatistics: {
//           items: [
//             {
//               'QUERY PLAN': [
//                 {
//                   Plan: {
//                     'Node Type': 'Seq Scan',
//                     'Parallel Aware': false,
//                     'Relation Name': 'items',
//                     Alias: 'items',
//                     'Startup Cost': 0,
//                     'Total Cost': 11.9,
//                     'Plan Rows': 190,
//                     'Plan Width': 391,
//                     'Actual Startup Time': 0.01,
//                     'Actual Total Time': 0.015,
//                     'Actual Rows': 12,
//                     'Actual Loops': 1,
//                   },
//                   'Planning Time': 0.281,
//                   Triggers: [],
//                   'Execution Time': 0.038,
//                 },
//               ],
//             },
//           ],
//         },
//         querySchema: 'schemaA',
//         queryLabel: 'get all from items',
//       },
//       {
//         queryString: 'SELECT * FROM public.users',
//         queryData:
//           [
//             {
//               _id: 1,
//               email: 'cc2368@cornell.edu',
//               firstName: 'Catherine',
//               lastName: 'Chiu',
//               password: 'helloworld',
//               points: 500,
//               address_id: '1',
//             },
//             {
//               _id: 2,
//               email: 'jm@gmail.com',
//               firstName: 'John',
//               lastName: 'Madrigal',
//               password: 'helloworld',
//               points: 500,
//               address_id: '2',
//             },
//           ],
//         queryStatistics: {
//           items: [
//             {
//               'QUERY PLAN': [
//                 {
//                   Plan: {
//                     'Node Type': 'Seq Scan',
//                     'Parallel Aware': false,
//                     'Relation Name': 'users',
//                     Alias: 'users',
//                     'Startup Cost': 0,
//                     'Total Cost': 12.3,
//                     'Plan Rows': 230,
//                     'Plan Width': 316,
//                     'Actual Startup Time': 0.011,
//                     'Actual Total Time': 0.011,
//                     'Actual Rows': 15,
//                     'Actual Loops': 1,
//                   },
//                   'Planning Time': 0.367,
//                   Triggers: [],
//                   'Execution Time': 0.045,
//                 },
//               ],
//             },
//           ],
//         },
//         querySchema: 'schemaC',
//         queryLabel: 'get all from users',
//       },
//       {
//         queryString: 'SELECT * FROM public.locations',
//         queryData:
//           [
//             {
//               _id: 1,
//               email: 'cc2368@cornell.edu',
//               firstName: 'Catherine',
//               lastName: 'Chiu',
//               password: 'helloworld',
//               points: 500,
//               address_id: '1',
//             },
//             {
//               _id: 2,
//               email: 'jm@gmail.com',
//               firstName: 'John',
//               lastName: 'Madrigal',
//               password: 'helloworld',
//               points: 500,
//               address_id: '2',
//             },
//           ],
//         queryStatistics: {
//           items: [
//             {
//               'QUERY PLAN': [
//                 {
//                   Plan: {
//                     'Node Type': 'Seq Scan',
//                     'Parallel Aware': false,
//                     'Relation Name': 'users',
//                     Alias: 'users',
//                     'Startup Cost': 0,
//                     'Total Cost': 12.3,
//                     'Plan Rows': 230,
//                     'Plan Width': 316,
//                     'Actual Startup Time': 0.012,
//                     'Actual Total Time': 0.011,
//                     'Actual Rows': 33,
//                     'Actual Loops': 1,
//                   },
//                   'Planning Time': 0.378,
//                   Triggers: [],
//                   'Execution Time': 0.034,
//                 },
//               ],
//             },
//           ],
//         },
//         querySchema: 'schemaB',
//         queryLabel: 'get all from locations',
//       },
//       {
//         queryString: 'SELECT * FROM public.users INNER JOIN public.locations...',
//         queryData:
//           [
//             {
//               _id: 1,
//               email: 'cc2368@cornell.edu',
//               firstName: 'Catherine',
//               lastName: 'Chiu',
//               password: 'helloworld',
//               points: 500,
//               address_id: '1',
//             },
//             {
//               _id: 2,
//               email: 'jm@gmail.com',
//               firstName: 'John',
//               lastName: 'Madrigal',
//               password: 'helloworld',
//               points: 500,
//               address_id: '2',
//             },
//           ],
//         queryStatistics: {
//           items: [
//             {
//               'QUERY PLAN': [
//                 {
//                   Plan: {
//                     'Node Type': 'Seq Scan',
//                     'Parallel Aware': false,
//                     'Relation Name': 'users',
//                     Alias: 'users',
//                     'Startup Cost': 0,
//                     'Total Cost': 12.3,
//                     'Plan Rows': 230,
//                     'Plan Width': 316,
//                     'Actual Startup Time': 0.03,
//                     'Actual Total Time': 0.4,
//                     'Actual Rows': 12,
//                     'Actual Loops': 1,
//                   },
//                   'Planning Time': 0.367,
//                   Triggers: [],
//                   'Execution Time': 0.023,
//                 },
//               ],
//             },
//           ],
//         },
//         querySchema: 'schemaB',
//         queryLabel: 'join tables users and locations',
//       },
//       {
//         queryString: 'SELECT * FROM public.users',
//         queryData:
//           [
//             {
//               _id: 1,
//               email: 'cc2368@cornell.edu',
//               firstName: 'Catherine',
//               lastName: 'Chiu',
//               password: 'helloworld',
//               points: 500,
//               address_id: '1',
//             },
//             {
//               _id: 2,
//               email: 'jm@gmail.com',
//               firstName: 'John',
//               lastName: 'Madrigal',
//               password: 'helloworld',
//               points: 500,
//               address_id: '2',
//             },
//           ],
//         queryStatistics: {
//           items: [
//             {
//               'QUERY PLAN': [
//                 {
//                   Plan: {
//                     'Node Type': 'Seq Scan',
//                     'Parallel Aware': false,
//                     'Relation Name': 'users',
//                     Alias: 'users',
//                     'Startup Cost': 0,
//                     'Total Cost': 12.3,
//                     'Plan Rows': 230,
//                     'Plan Width': 316,
//                     'Actual Startup Time': 0.019,
//                     'Actual Total Time': 0.019,
//                     'Actual Rows': 19,
//                     'Actual Loops': 1,
//                   },
//                   'Planning Time': 0.411,
//                   Triggers: [],
//                   'Execution Time': 0.034,
//                 },
//               ],
//             },
//           ],
//         },
//         querySchema: 'schemaC',
//         queryLabel: 'get all from users - revised',
//       },
//       {
//         queryString: 'SELECT * FROM public.locations UNION public.regions',
//         queryData:
//           [
//             {
//               _id: 1,
//               email: 'cc2368@cornell.edu',
//               firstName: 'Catherine',
//               lastName: 'Chiu',
//               password: 'helloworld',
//               points: 500,
//               address_id: '1',
//             },
//             {
//               _id: 2,
//               email: 'jm@gmail.com',
//               firstName: 'John',
//               lastName: 'Madrigal',
//               password: 'helloworld',
//               points: 500,
//               address_id: '2',
//             },
//           ],
//         queryStatistics: {
//           items: [
//             {
//               'QUERY PLAN': [
//                 {
//                   Plan: {
//                     'Node Type': 'Seq Scan',
//                     'Parallel Aware': false,
//                     'Relation Name': 'users',
//                     Alias: 'users',
//                     'Startup Cost': 0,
//                     'Total Cost': 12.3,
//                     'Plan Rows': 230,
//                     'Plan Width': 316,
//                     'Actual Startup Time': 0.012,
//                     'Actual Total Time': 0.013,
//                     'Actual Rows': 11,
//                     'Actual Loops': 1,
//                   },
//                   'Planning Time': 0.201,
//                   Triggers: [],
//                   'Execution Time': 0.034,
//                 },
//               ],
//             },
//           ],
//         },
//         querySchema: 'schemaB',
//         queryLabel: 'union locations and regions',
//       },
//       {
//         queryString: 'SELECT * FROM public.items',
//         queryData:
//           [
//             {
//               _id: 1,
//               email: 'cc2368@cornell.edu',
//               firstName: 'Catherine',
//               lastName: 'Chiu',
//               password: 'helloworld',
//               points: 500,
//               address_id: '1',
//             },
//             {
//               _id: 2,
//               email: 'jm@gmail.com',
//               firstName: 'John',
//               lastName: 'Madrigal',
//               password: 'helloworld',
//               points: 500,
//               address_id: '2',
//             },
//           ],
//         queryStatistics: {
//           items: [
//             {
//               'QUERY PLAN': [
//                 {
//                   Plan: {
//                     'Node Type': 'Seq Scan',
//                     'Parallel Aware': false,
//                     'Relation Name': 'items',
//                     Alias: 'items',
//                     'Startup Cost': 0,
//                     'Total Cost': 11.9,
//                     'Plan Rows': 190,
//                     'Plan Width': 391,
//                     'Actual Startup Time': 0.012,
//                     'Actual Total Time': 0.021,
//                     'Actual Rows': 6,
//                     'Actual Loops': 1,
//                   },
//                   'Planning Time': 0.45,
//                   Triggers: [],
//                   'Execution Time': 0.038,
//                 },
//               ],
//             },
//           ],
//         },
//         querySchema: 'schemaA',
//         queryLabel: 'get all from items - add items',
//       },
//       {
//         queryString: 'SELECT * FROM public.users',
//         queryData:
//           [
//             {
//               _id: 1,
//               email: 'cc2368@cornell.edu',
//               firstName: 'Catherine',
//               lastName: 'Chiu',
//               password: 'helloworld',
//               points: 500,
//               address_id: '1',
//             },
//             {
//               _id: 2,
//               email: 'jm@gmail.com',
//               firstName: 'John',
//               lastName: 'Madrigal',
//               password: 'helloworld',
//               points: 500,
//               address_id: '2',
//             },
//           ],
//         queryStatistics: {
//           items: [
//             {
//               'QUERY PLAN': [
//                 {
//                   Plan: {
//                     'Node Type': 'Seq Scan',
//                     'Parallel Aware': false,
//                     'Relation Name': 'users',
//                     Alias: 'users',
//                     'Startup Cost': 0,
//                     'Total Cost': 12.3,
//                     'Plan Rows': 230,
//                     'Plan Width': 316,
//                     'Actual Startup Time': 0.02,
//                     'Actual Total Time': 0.011,
//                     'Actual Rows': 11,
//                     'Actual Loops': 1,
//                   },
//                   'Planning Time': 0.211,
//                   Triggers: [],
//                   'Execution Time': 0.034,
//                 },
//               ],
//             },
//           ],
//         },
//         querySchema: 'schemaB',
//         queryLabel: 'get all from users - system update',
//       },
//       {
//         queryString: 'SELECT items.id FROM public.items',
//         queryData:
//           [
//             {
//               _id: 1,
//               email: 'cc2368@cornell.edu',
//               firstName: 'Catherine',
//               lastName: 'Chiu',
//               password: 'helloworld',
//               points: 500,
//               address_id: '1',
//             },
//             {
//               _id: 2,
//               email: 'jm@gmail.com',
//               firstName: 'John',
//               lastName: 'Madrigal',
//               password: 'helloworld',
//               points: 500,
//               address_id: '2',
//             },
//           ],
//         queryStatistics: {
//           items: [
//             {
//               'QUERY PLAN': [
//                 {
//                   Plan: {
//                     'Node Type': 'Seq Scan',
//                     'Parallel Aware': false,
//                     'Relation Name': 'users',
//                     Alias: 'users',
//                     'Startup Cost': 0,
//                     'Total Cost': 12.3,
//                     'Plan Rows': 230,
//                     'Plan Width': 316,
//                     'Actual Startup Time': 0.012,
//                     'Actual Total Time': 0.009,
//                     'Actual Rows': 17,
//                     'Actual Loops': 1,
//                   },
//                   'Planning Time': 0.367,
//                   Triggers: [],
//                   'Execution Time': 0.235,
//                 },
//               ],
//             },
//           ],
//         },
//         querySchema: 'schemaA',
//         queryLabel: 'get ids from items',
//       },
//       {
//         queryString: 'SELECT items.categories FROM public.items',
//         queryData:
//           [
//             {
//               _id: 1,
//               email: 'cc2368@cornell.edu',
//               firstName: 'Catherine',
//               lastName: 'Chiu',
//               password: 'helloworld',
//               points: 500,
//               address_id: '1',
//             },
//             {
//               _id: 2,
//               email: 'jm@gmail.com',
//               firstName: 'John',
//               lastName: 'Madrigal',
//               password: 'helloworld',
//               points: 500,
//               address_id: '2',
//             },
//           ],
//         queryStatistics: {
//           items: [
//             {
//               'QUERY PLAN': [
//                 {
//                   Plan: {
//                     'Node Type': 'Seq Scan',
//                     'Parallel Aware': false,
//                     'Relation Name': 'users',
//                     Alias: 'users',
//                     'Startup Cost': 0,
//                     'Total Cost': 12.3,
//                     'Plan Rows': 230,
//                     'Plan Width': 316,
//                     'Actual Startup Time': 0.019,
//                     'Actual Total Time': 0.011,
//                     'Actual Rows': 15,
//                     'Actual Loops': 1,
//                   },
//                   'Planning Time': 0.367,
//                   Triggers: [],
//                   'Execution Time': 0.124,
//                 },
//               ],
//             },
//           ],
//         },
//         querySchema: 'schemaD',
//         queryLabel: 'get categories from items',
//       },
//       {
//         queryString: 'SELECT * FROM public.items',
//         queryData:
//           [
//             {
//               _id: 1,
//               email: 'cc2368@cornell.edu',
//               firstName: 'Catherine',
//               lastName: 'Chiu',
//               password: 'helloworld',
//               points: 500,
//               address_id: '1',
//             },
//             {
//               _id: 2,
//               email: 'jm@gmail.com',
//               firstName: 'John',
//               lastName: 'Madrigal',
//               password: 'helloworld',
//               points: 500,
//               address_id: '2',
//             },
//           ],
//         queryStatistics: {
//           items: [
//             {
//               'QUERY PLAN': [
//                 {
//                   Plan: {
//                     'Node Type': 'Seq Scan',
//                     'Parallel Aware': false,
//                     'Relation Name': 'items',
//                     Alias: 'items',
//                     'Startup Cost': 0,
//                     'Total Cost': 11.9,
//                     'Plan Rows': 190,
//                     'Plan Width': 391,
//                     'Actual Startup Time': 0.013,
//                     'Actual Total Time': 0.019,
//                     'Actual Rows': 6,
//                     'Actual Loops': 1,
//                   },
//                   'Planning Time': 0.288,
//                   Triggers: [],
//                   'Execution Time': 0.038,
//                 },
//               ],
//             },
//           ],
//         },
//         querySchema: 'schemaA',
//         queryLabel: 'get all from items',
//       },
//     ],
//     currentSchema: 'schemaB',
//   };