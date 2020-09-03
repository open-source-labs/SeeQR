import React, { Component, MouseEvent, ChangeEvent } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
const { ipcRenderer } = window.require('electron');
import typeOptions from './typeOptions'

type ClickEvent = React.MouseEvent<HTMLElement>;

// onClose property responds to onClose function
type GenerateDataProps = {
  onClose: any;
};

type state = {
  tables : Array<string>,
  currentTable : any,
  scale : any,
  columns : any,
};



class GenerateData extends Component<GenerateDataProps, state> {
  constructor(props: GenerateDataProps) {
    super(props);
    // bind form submission function
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }
  state: state = {
    tables : ['table1', 'table2'],
    currentTable : '',
    scale : 0,
    columns : [
      {    
        name : '',  
        dataCategory : '',
        dataType : '',
        data : {},
      }
    ],
  };
  
  handleAddColumn (event: any) {
    const {columns} = this.state.columns;
    const newCol = {  
      name : '',  
      dataCategory : '',
      dataType : '',
      data : {},
    }
    columns.push(newCol)
    this.setState({ columns })
  }

  handleRemoveColumn (event: any) {
    const {columns} = this.state.columns;
    columns.pop();
    this.setState({ columns });
  }

  handleFormSubmit (event: any) {
    event.preventDefault();
    // pass down any state from the form
    const formObj = {
      schema : 'public',
      table : this.state.currentTable,
      scale : this.state.scale,
      columns : this.state.columns,
    };
    // on submit button click, sends form obj to backend
    ipcRenderer.send('form-input', formObj);
    console.log(`sending ${formObj} to main process`);
    // const newTables : Array<string> = [];
    // this.state.tables.forEach(e => {
    //   if (e !== this.state.currentTable) newTables.push(e)
    // });
    this.setState({ 
      // tables : newTables,  
      currentTable : '',
      scale : 0,
      columns : [
        {    
          name : '',  
          dataCategory : '',
          dataType : '',
          data : {},
        }
      ],
    });
  }
  // close modal function
  onClose = (event: any) => {
    this.props.onClose && this.props.onClose(event);
  };
// input all form input fields under "form" and link to event handlers to save to state
// bind all functions for field entries on the form
  render() {
    let columnTypes : string = '';
    this.state.columns.forEach((column, i) => {
      let renderString : string = ''
      
      renderString += `<div>Column Name:</div><input type="text" name="${column}" onChange={(e)=>{this.setState({ ${column}.name : e})}}/>`;

      renderString += `<div>Data Type:</div><select>{typeOptions.dropdown.map((elem) => <option key={elem} onChange={(e)=>{this.setState({ ${column} : e} )}}>{elem}</option>)}</select>`;
          
      if (column.dataCategory.length > 0) {
        renderString += `<select>{typeOptions[${column.dataCategory}].dropdown.map((elem) => <option key="elem" onChange={(e) => {typeOptions[${column.dataCategory}].add(e, ${i})}}>{elem}</option>)}</select>`;
      };

      if (typeOptions[column.dataCategory][column.dataType].length) {
        let output = ''
          typeOptions[column.dataCategory][column.dataType].forEach((el, k)=> {
            let localResult = '';
            if (el.display) {
              localResult = `${el.option}<input type="${el.type}" name={"option${k}"} onChange={(e)=>{${el.add}(e)}}/>`
            } else { 
              el.add(k);
            }
            output += localResult;
          })
          renderString += output;
        }
    columnTypes += renderString;  
    })

    return (
      <div>
        <form onSubmit={this.handleFormSubmit}>
          <div id="modal-buttons">
            Generate data on empty tables.

            Table:
            <select>
              {this.state.tables.map((elem) => <option key={elem} onChange={(e)=>{this.setState({currentTable : e})}}>{elem}</option>)}
            </select>
            
            Scale:
            <input type="number" name="scale" onChange={(e)=>{this.setState({scale : e})}}/>

            
            <div>{columnTypes}</div>


            <input type="button" onClick={this.handleAddColumn(e)}>+</input>
            <input type="button" onClick={this.handleRemoveColumn(e)}>-</input>
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

export default GenerateData;