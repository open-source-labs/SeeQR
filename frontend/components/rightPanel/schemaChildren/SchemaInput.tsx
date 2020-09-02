import React, { Component, MouseEvent, ChangeEvent } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
const { ipcRenderer } = window.require('electron');
import GenerateData from './GenerateData';

type ClickEvent = React.MouseEvent<HTMLElement>;

type SchemaInputProps = {
  onClose: any;
};

type state = {
  schemaName: string;
  schemaEntry: string;
  schemaFilePath: '';
};

class SchemaInput extends Component<SchemaInputProps, state> {
  constructor(props: SchemaInputProps) {
    super(props);
    this.handleSchemaSubmit = this.handleSchemaSubmit.bind(this);
    this.handleSchemaEntry = this.handleSchemaEntry.bind(this);
  }
  state: state = {
    schemaName: '',
    schemaFilePath: '',
    schemaEntry: '',
  };
  handleSchemaEntry(event: any) {
    this.setState({ schemaEntry: event.target.value });
    this.setState({ schemaFilePath: '' });
    console.log('schema entry: ', this.state.schemaEntry);
    console.log('schema entry type: ', typeof this.state.schemaEntry);
  }
  handleSchemaSubmit(event: any) {
    event.preventDefault();

    const schemaObj = {
      schemaName: this.state.schemaName,
      schemaFilePath: this.state.schemaFilePath,
      schemaEntry: this.state.schemaEntry,
    };
    ipcRenderer.send('input-schema', schemaObj);
    console.log(`sending ${schemaObj} to main process`);
  }
  onClose = (event: any) => {
    this.props.onClose && this.props.onClose(event);
  };

  render() {
    return (
      <div>
        <form>
          <input
            className="schema-text-field"
            type="text"
            placeholder="Input Schema Here..."
            onChange={(e) => this.handleSchemaEntry(e)}
          />
          CREATE TABLE public.users (
            "_id" serial NOT NULL,
            "email" varchar UNIQUE NOT NULL,
            "firstName" varchar (50) NOT NULL,
            "lastName" varchar (50) NOT NULL,
            "password" varchar NOT NULL,
            "points" integer,
            "address_id" bigint NOT NULL,
            CONSTRAINT "users_pk" PRIMARY KEY ("_id")
          ) WITH (
            OIDS=FALSE
          );
          
          CREATE TABLE public.address (
            "_id" serial NOT NULL,
            "zipcode" integer NOT NULL,
            "street" varchar NOT NULL,
            "city" varchar NOT NULL,
            "state" varchar NOT NULL,
            CONSTRAINT "address_pk" PRIMARY KEY ("_id")
          ) WITH (
            OIDS=FALSE
          );
          
          CREATE TABLE public.sessions (
            "_id" serial NOT NULL,
            "cookie" varchar NOT NULL,
            "created_At" DATE NOT NULL,
            "user_id" int NOT NULL,
            "expiration" int NOT NULL,
          CONSTRAINT "sessions_pk" PRIMARY KEY ("_id")
          ) WITH (
            OIDS=FALSE
          );
          
          CREATE TABLE public.items (
            "_id" serial NOT NULL,
            "title" varchar NOT NULL,
            "description" varchar (100) NOT NULL,
            "image" varchar NOT NULL,
            "category" varchar NOT NULL,
            "status" BOOLEAN,
            "user_id" bigint NOT NULL,
              CONSTRAINT "items_pk" PRIMARY KEY ("_id")
          ) WITH (
            OIDS=FALSE
          );
          
          
          
          
           ALTER TABLE public.users ADD FOREIGN KEY ("address_id") REFERENCES public.address("_id");
           ALTER TABLE public.items ADD CONSTRAINT "items_fk0" FOREIGN KEY ("user_id") REFERENCES public.users("_id");
           ALTER TABLE public.sessions ADD FOREIGN KEY ("user_id") REFERENCES public.users("_id");
          
          
          
           INSERT INTO public.address VALUES (1, 92663, '123 daisy lane', 'oc', 'california');
           INSERT INTO public.address VALUES (2, 92663, '123 orchid lane', 'los angeles', 'california');
           INSERT INTO public.address VALUES (3, 92663, '123 lily lane', 'sb', 'california');
           INSERT INTO public.address VALUES (4, 92663, '123 basil lane', 'nyc', 'ny');
          
           INSERT INTO public.users VALUES (1, 'cc2368@cornell.edu', 'Catherine', 'Chiu', 'helloworld', 500, 1);
           INSERT INTO public.users VALUES (2, 'jm@gmail.com', 'John', 'Madrigal', 'helloworld', 500, 2);
           INSERT INTO public.users VALUES (3, 'mh@gmail.com', 'Michelle', 'Holland', 'helloworld', 500, 3);
           INSERT INTO public.users VALUES (4, 'sk@gmail.com', 'Serena', 'Kuo', 'helloworld',  500, 4);
          
           INSERT INTO public.items VALUES (1, 'fiddle leaf fig', 'lovely green addition to your home', 'image.url', 'home goods', FALSE, 1);
           INSERT INTO public.items VALUES (2, 'monstera leaf', 'lovely green addition to your home', 'image.url', 'home goods', FALSE, 1);
           INSERT INTO public.items VALUES (3, 'bamboo palm', 'lovely green addition to your home', 'image.url', 'home goods', FALSE, 1);
           INSERT INTO public.items VALUES (4, 'orchid', 'lovely green addition to your home', 'image.url', 'home goods', FALSE, 1);
          
           INSERT INTO public.sessions VALUES (1, 'cookie', '2020-07-27', 1, 500000);
          
           select setval('public.users__id_seq', 5, false);
           select setval('public.address__id_seq', 5, false);
           select setval('public.items__id_seq', 5, false);
            select setval('public.sessions__id_seq', 2, false);
          
          
          <div id="modal-buttons">
            <button>submit</button>
            <div className="actions">
              <button className="toggle-button" onClick={this.onClose}>
                close
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default SchemaInput;
