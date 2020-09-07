import React, { Component, MouseEvent, ChangeEvent } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
const { ipcRenderer } = window.require('electron');
const typeOptions = require('./GenerateObj');

type ClickEvent = React.MouseEvent<HTMLElement>;

type GenerateDataColumnProps = {

};

type state = {
  tables : Array<string>,
  currentTable : any,
  scale : any,
  columns : any,
};



class GenerateDataColumn extends Component<GenerateDataColumnProps, state> {
  constructor(props: GenerateDataColumnProps) {
    super(props);
  }
  state: any = {
  };

  render() {
    return (
      <div>
        <div>
          Column Name: 
          <input type="text" className="columnName"/>
        </div>
        <div>
          Data Type:
          <select>
                {typeOptions.dropdown((elem) => <option key={elem} onChange={(e)=>{this.setState({currentTable : e})}}>{elem}</option>)}
          </select>
          <DataType />
        </div>
        <DataOptions />
      </div>
    );
  };
};

class DataType extends Component<GenerateDataColumnProps, state> {
  constructor(props: GenerateDataColumnProps) {
    super(props);
  }
  state: any = {

  };


  render() {
    return (
      <div>
        <div>
          Column Name: 
          <input type="text" className="columnName"/>
        </div>
        <div>
          Data Type:

        </div>
      </div>
    );
  };
};

class DataOptions extends Component<GenerateDataColumnProps, state> {
  constructor(props: GenerateDataColumnProps) {
    super(props);
  }
  state: any = {

  };


  render() {
    return (
      <div>
        <div>
          Column Name: 
          <input type="text" className="columnName"/>
        </div>
        <div>
          Data Type:

          <DataType />

        </div>
      </div>
    );
  };
};



export default GenerateDataColumn;