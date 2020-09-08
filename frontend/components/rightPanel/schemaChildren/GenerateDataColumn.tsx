import React, { Component, MouseEvent, ChangeEvent } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
const { ipcRenderer } = window.require('electron');
const typeOptions = require('./GenerateObj');

type ClickEvent = React.MouseEvent<HTMLElement>;

type column = {
  name : string,  
  dataCategory : string,
  dataType : string,
  data : any,
}

type Props = {
  key : string,
  columnIndex : number,
  columnObj : column,
  updateState : any,
};

type GenerateDataColumnState = {};

class GenerateDataColumn extends Component<Props, GenerateDataColumnState> {
  constructor(props: Props) {
    super(props);
  }
  state: GenerateDataColumnState = {};

  render() {
    return (
      <div>
        <div>
          Column Name: 
          <input type="text" className="DGI-columnName"/>
        </div>
        <div>
          Data Type:
          <select className="DGI-dataType">
              {typeOptions.dropdown((elem) => {<option key={elem} onChange={(e)=>{this.props.updateState(this.props.key, e, 'dataCategory', false, false)}}>{elem}</option>})}
          </select>
          <DataType key={this.props.key + 'datatype' + this.props.columnIndex} columnIndex={this.props.columnIndex} columnObj={this.props.columnObj} updateState={this.props.updateState} />
        </div>
        <DataOptions key={this.props.key + 'dataoptions' + this.props.columnIndex} columnIndex={this.props.columnIndex} columnObj={this.props.columnObj} updateState={this.props.updateState} />
      </div>
    );
  };
};

// type DataTypeProps = {};
type DataTypeState = {};
class DataType extends Component<Props, DataTypeState> {
  constructor(props: Props) {
    super(props);
  }
  state: DataTypeState = {};

  render() {
    let message;
    if (typeOptions[this.props.columnObj.dataCategory].message) {
      message = <div className="DGI-message">{typeOptions[this.props.columnObj.dataCategory].message}</div>
    }
    return (
      <div>
        <select className="DGI-dataType">
          {typeOptions[this.props.columnObj.dataCategory].dropdown((elem) => {<option key={elem} onChange={(e)=>{this.props.updateState(this.props.key, e, 'dataType', false, false)}}>{elem}</option>})}
        </select>
        { message }
      </div>
      
    );
  };
};

// type DataOptionsProps = {};
type DataOptionsState = {};

class DataOptions extends Component<Props, DataOptionsState> {
  constructor(props: Props) {
    super(props);
  }
  state: DataOptionsState = {};

  render() { 
    let dataOptions : Array<any> = [];
      typeOptions[this.props.columnObj.dataCategory][this.props.columnObj.dataType].forEach( option => {
        if (!option.display) this.props.updateState(this.props.key, option.value, 'data', option.location, option.format);
        else {
          dataOptions.push(<div>{option.option}: <input type={option.type} onChange={(e)=>{this.props.updateState(this.props.key, e, 'data', option.location, option.format)}}/></div>)
        }
      })
    return (
      <div>
        { dataOptions }
      </div>
    );
  };
};



export default GenerateDataColumn;