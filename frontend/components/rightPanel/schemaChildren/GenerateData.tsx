import React, { Component, MouseEvent, ChangeEvent } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
const { ipcRenderer } = window.require('electron');
import GenerateDataColumn from './GenerateDataColumn';

// import typeOptions from './typeOptions'

type ClickEvent = React.MouseEvent<HTMLElement>;

// onClose property responds to onClose function
type GenerateDataProps = {
  onClose: any;
};

type column = {
  // name : string,  
  // dataCategory : string,
  // dataType : string,
  // data : any,
}

type state = {
  // tables : Array<string>,
  // currentTable : any,
  // scale : any,
  // columns : Array<column>,
};


class GenerateData extends Component/*<GenerateDataProps, state>*/ {
  constructor(props: any) {
    super(props);

    // this.handleAddColumn = this.handleAddColumn.bind(this);
    // this.handleRemoveColumn = this.handleRemoveColumn.bind(this);
    this.componentChangeState = this.componentChangeState.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }
  state: any = {
    tables : ['TABLE', 'tables', 'tAbElZ'],
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

  // ipcRenderer.on('db-lists', (event: any, returnedLists: any) => {
  //     this.setState({ dbLists: returnedLists.tableList })
  //   });

  // handleAddColumn () {
  //   const {columns} = this.state.columns;
  //   const newCol = {  
  //     name : '',  
  //     dataCategory : '',
  //     dataType : '',
  //     data : {},
  //   };
  //   columns.push(newCol);
  //   this.setState({ columns });
  // }

  // handleRemoveColumn () {
  //   const {columns} = this.state.columns;
  //   columns.pop();
  //   this.setState({ columns });
  // }

  componentChangeState (i : number, value : any, property : any, subProperty : any) {
    const { columns } = this.state;
    (!subProperty) ? columns[i][property] = value : columns[i][property][subProperty];
    this.setState( { columns });
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
    const columns : any = [];
    this.state.columns.forEach( (e : any, i : number) => {
      columns.push(`<div><GenerateDataColumn key=${i} columnID=${i} columnObj=${e} updateState={this.componentChangeState}/></div>`);
    })

    return (
      <div>
        <form onSubmit={this.handleFormSubmit}>
          <div id="modal-buttons">
            <div>Generate data on empty tables.</div>    
            <div>
              Table:
              <select>
                {this.state.tables.map((elem) => <option key={elem} onChange={(e)=>{this.setState({currentTable : e})}}>{elem}</option>)}
              </select>
            </div>
            <br />
            <div>
              Scale:
              <input type="number" name="scale" min="1" defaultValue="# of records" onChange={(e)=>{this.setState({scale : e})}}/>
            </div>
            <div>{columns}</div>
            <div><GenerateDataColumn key="0" columnObj={this.state.columns[0]} updateState={this.componentChangeState}/></div>

            
            {/* <input type="button" onClick={e => this.handleAddColumn()}>+</input>
            <input type="button" onClick={e => this.handleRemoveColumn()}>-</input> */}
            <div className="actions">
              <button className="toggle-button" onClick={this.onClose}>
                close
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };
};

export default GenerateData;