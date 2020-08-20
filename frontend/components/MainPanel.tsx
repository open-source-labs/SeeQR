import React, { Component, MouseEvent } from 'react';
const { ipcRenderer } = window.require('electron');
import { Compare } from './leftPanel/Compare';
import { History } from './leftPanel/History';
import { SchemaContainer } from './rightPanel/SchemaContainer';

type ClickEvent = React.MouseEvent<HTMLElement>;

type MainState = {
  queries: {
    queryString: string;
    queryData: object[];
    queryStatistics: object[];
    querySchema: string;
  }[];
  currentSchema: string;
};

type MainProps = {};

class MainPanel extends Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
  }

  state: MainState = {
    queries: [
      {
        queryString: 'SELECT * FROM public.items',
        queryData: [
          {
            _id: 1,
            title: 'fiddle leaf fig',
            description: 'lovely green addition to your home',
            image:
              'https://cdn.shopify.com/s/files/1/0013/3529/6118/products/Kent-48-3265.048-WH_Fiddle-Leaf-Fig-Tree-14.jpg?v=1590447682',
            category: 'home goods',
            status: false,
            user_id: '1',
            item_latitude: '37.4224764',
            item_longitude: '-122.0842499',
          },
          {
            _id: 2,
            title: 'monstera leaf',
            description: 'lovely green addition to your home',
            image:
              'https://cdn.shopify.com/s/files/1/0150/6262/products/the-sill_monstera_variant_medium_grant_cream_54108884-3d3d-44f4-9c34-d741345067ab_1200x.jpg?v=1589821773',
            category: 'home goods',
            status: false,
            user_id: '1',
            item_latitude: '37.4224764',
            item_longitude: '-122.0842499',
          },
        ],
        queryStatistics: [
          {
            'QUERY PLAN':
              'Seq Scan on items  (cost=0.00..11.90 rows=190 width=391) (actual time=0.004..0.004 rows=6 loops=1)',
          },
          { 'QUERY PLAN': 'Planning Time: 0.284 ms' },
          { 'QUERY PLAN': 'Execution Time: 0.027 ms' },
        ],
        querySchema: 'schemaA',
      },
      {
        queryString: 'SELECT * FROM public.users',
        queryData: [
          {
            _id: 1,
            email: 'cc2368@cornell.edu',
            firstName: 'Catherine',
            lastName: 'Chiu',
            password: 'helloworld',
            points: 500,
            address_id: '1',
          },
          {
            _id: 2,
            email: 'jm@gmail.com',
            firstName: 'John',
            lastName: 'Madrigal',
            password: 'helloworld',
            points: 500,
            address_id: '2',
          },
        ],
        queryStatistics: [
          {
            'QUERY PLAN':
              'Seq Scan on users  (cost=0.00..12.30 rows=230 width=316) (actual time=0.015..0.016 rows=15 loops=1)',
          },
          { 'QUERY PLAN': 'Planning Time: 0.329 ms' },
          { 'QUERY PLAN': 'Execution Time: 0.037 ms' },
        ],
        querySchema: 'schemaB',
      },
    ],
    currentSchema: 'schemaB',
  };

  render() {
    ipcRenderer.on('return-execute-query', (event: any, data: string) => {
      console.log('data', data)
      let output = JSON.parse(data);
      console.log("PARSED-DATA", output);
    });
    return (
      <div id="main-panel">
        <div id="main-left">
          <h3 style={{ border: '1px solid blue' }}>This is the main panel!</h3>
          <History queries={this.state.queries} currentSchema={this.state.currentSchema} />
          <Compare />
        </div>
        <SchemaContainer currentSchema={this.state.currentSchema} />
      </div>
    );
  }
}

export default MainPanel;
