import React, { Component, MouseEvent, ChangeEvent } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
const { ipcRenderer } = window.require('electron');
const typeOptions = require('./GenerateObj');

type ClickEvent = React.MouseEvent<HTMLElement>;

type column = {
  // name : string,  
  // dataCategory : string,
  // dataType : string,
  // data : any,
}

type Props = {
  // key : string,
  // columnObj : column,
  // updateState : any,
};

type GenerateDataColumnState = {

};

class GenerateDataColumn extends Component/*<Props, GenerateDataColumnState>*/ {
  constructor(props: any) {
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
              {typeOptions.dropdown((elem) => {<option key={elem} onChange={(e)=>{this.props.updateState(this.props.key, e, 'dataCategory')}}>{elem}</option>})}
          </select>
          <DataType key={this.props.key} columnObj={this.props.columnObj} updateState={this.props.updateState} />
        </div>
        <DataOptions key={this.props.key} columnObj={this.props.columnObj} updateState={this.props.updateState} />
      </div>
    );
  };
};

// type DataTypeProps = {};
// type DataTypeState = {};


/*
  props
  key=${i} 
  columnID=${i} 
  columnObj = {    
        name : '',  
        dataCategory : '',
        dataType : '',
        data : {},
      } 
  updateState = (i : number, property : string, value : any) {
        const { columns } = this.state;
        columns[i][property] = value;
        this.setState( { columns });
      }
*/
class DataType extends Component/*<Props, DataTypeState>*/ {
  constructor(props: any) {
    super(props);
  }
  state: any = {

  };

  render() {
    return (
      <div>
        {typeOptions[this.props.columnObj.dataCategory].dropdown((elem) => {<option key={elem} onChange={(e)=>{this.props.updateState(this.props.key, e, 'dataType')}}>{elem}</option>})}
      </div>
    );
  };
};

type DataOptionsProps = {};
type DataOptionsState = {};

class DataOptions extends Component/*<Props, DataOptionsState>*/ {
  constructor(props: any) {
    super(props);
  }
  state: any = {

  };

 

  render() { 
    let dataOptions = [];
      typeOptions[this.props.columnObj.dataCategory][this.props.columnObj.dataType].forEach( e => {
        if (!e.display) this.props.updateState(this.props.key, e.value, 'data', e.location);
        else {
          dataOptions.push(`<div>`)
        }
      
    })
    return (
      <div>

      </div>
    );
  };
};



export default GenerateDataColumn;