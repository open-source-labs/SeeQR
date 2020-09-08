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
  key : number,
  columnObj : column,
  updateState : any,
};

type GenerateDataColumnState = {
  empty : any,
};

class GenerateDataColumn extends Component<Props, GenerateDataColumnState> {
  constructor(props: Props) {
    super(props);
  }
  state: GenerateDataColumnState = {
    empty : '',
  };

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
type DataTypeState = {
  empty : any,
};
class DataType extends Component<Props, DataTypeState> {
  constructor(props: Props) {
    super(props);
  }
  state: DataTypeState = {
    empty : '',
  };

  render() {
    return (
      <div>
        <select className="DGI-dataType">
          {typeOptions[this.props.columnObj.dataCategory].dropdown((elem) => {<option key={elem} onChange={(e)=>{this.props.updateState(this.props.key, e, 'dataType')}}>{elem}</option>})}
        </select>
      </div>
    );
  };
};

// type DataOptionsProps = {};
type DataOptionsState = {
  empty : any,
};

class DataOptions extends Component<Props, DataOptionsState> {
  constructor(props: Props) {
    super(props);
  }
  state: DataOptionsState = {
    empty : '',
  };

  render() { 
    let dataOptions : Array<any> = [];
      typeOptions[this.props.columnObj.dataCategory][this.props.columnObj.dataType].forEach( option => {
        if (!option.display) this.props.updateState(this.props.key, option.value, 'data', option.location);
        else {
          dataOptions.push(<div>{option.option}: <input type={option.type} onChange={(e)=>{this.props.updateState(this.props.key, e, option.location)}}/></div>)
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