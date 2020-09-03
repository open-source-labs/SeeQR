import React, { Component, MouseEvent, ChangeEvent } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
const { ipcRenderer } = window.require('electron');

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

const typeOptions : any = {
  dropdown : ['unique', 'random'],
  add : (val) => {this.state.dataCategory = val},
  unique : {
    dropdown : ['string', 'number'],
    add : (val, i) => {
      if (val === 'string') this.setState({ columns[i].dataType : 'str' });
      else if (val === 'number') this.setState({ columns[i].dataType : 'num' });
    },
    str : [
      {
        display : true,
        option : 'Minimum Length',
        type : 'textbox',
        add : (val) => {this.state.data.length[0] = val},
      },
      {
        display : true,
        option : 'Maximum Length',
        type : 'textbox',
        add : (val) => {this.state.data.length[1] = val},
      },
      {
        display : true,
        option : 'Include lower case letters',
        type : 'checkbox',
        add : (val) => {this.state.data.inclAlphaLow = val},
      },
      {
        display : true,
        option : 'Include upper case letters',
        type : 'checkbox',
        add : (val) => {this.state.data.inclAlphaUp = val},
      },      
      {
        display : true,
        option : 'Include numbers',
        type : 'checkbox',
        add : (val) => {this.state.data.inclNum = val},
      },      
      {
        display : true,
        option : 'Include spaces',
        type : 'checkbox',
        add : (val) => {this.state.data.inclSpaces = val},
      },      
      {
        display : true,
        option : 'Include special characters',
        type : 'checkbox',
        add : (val) => {this.state.data.inclSpecChar = val},
      },
      {
        display : true,
        option : 'Include these values (separate by commas)',
        type : 'textbox',
        add : (val) => {this.state.data.include = val},
      },
    ],
    num : [
      {
        display : false,
        option : 'Serial',
        type : 'checkbox',
        add : (val) => {this.state.data.serial = val},
      },
    ],
  },
  random : {
    dropdown : [
      'Address - zipCode',
      'Address - zipCodeByState',
      'Address - city',
      'Address - cityPrefix',
      'Address - citySuffix',
      'Address - streetName',
      'Address - streetAddress',
      'Address - streetSuffix',
      'Address - streetPrefix',
      'Address - secondaryAddress',
      'Address - county',
      'Address - country',
      'Address - countryCode',
      'Address - state',
      'Address - stateAbbr',
      'Address - latitude',
      'Address - longitude',
      'Address - direction',
      'Address - cardinalDirection',
      'Address - ordinalDirection',
      'Address - nearbyGPSCoordinate',
      'Address - timeZone',
      'Commerce - color',
      'Commerce - department',
      'Commerce - productName',
      'Commerce - price',
      'Commerce - productAdjective',
      'Commerce - productMaterial',
      'Commerce - product',
      'Commerce - productDescription',
      'Company - suffixes',
      'Company - companyName',
      'Company - companySuffix',
      'Company - catchPhrase',
      'Company - bs',
      'Company - catchPhraseAdjective',
      'Company - catchPhraseDescriptor',
      'Company - catchPhraseNoun',
      'Company - bsAdjective',
      'Company - bsBuzz',
      'Company - bsNoun',
      'Database - column',
      'Database - type',
      'Database - collation',
      'Database - engine',
      'Date - past',
      'Date - future',
      'Date - between',
      'Date - recent',
      'Date - soon',
      'Date - month',
      'Date - weekday',
      'Finance - account',
      'Finance - accountName',
      'Finance - routingNumber',
      'Finance - mask',
      'Finance - amount',
      'Finance - transactionType',
      'Finance - currencyCode',
      'Finance - currencyName',
      'Finance - currencySymbol',
      'Finance - bitcoinAddress',
      'Finance - litecoinAddress',
      'Finance - creditCardNumber',
      'Finance - creditCardCVV',
      'Finance - ethereumAddress',
      'Finance - iban',
      'Finance - bic',
      'Finance - transactionDescription',
      'Git - branch',
      'Git - commitEntry',
      'Git - commitMessage',
      'Git - commitSha',
      'Git - shortSha',
      'Hacker - abbreviation',
      'Hacker - adjective',
      'Hacker - noun',
      'Hacker - verb',
      'Hacker - ingverb',
      'Hacker - phrase',
      'Helpers - randomize',
      'Helpers - slugify',
      'Helpers - replaceSymbolWithNumber',
      'Helpers - replaceSymbols',
      'Helpers - replaceCreditCardSymbols',
      'Helpers - repeatString',
      'Helpers - regexpStyleStringParse',
      'Helpers - shuffle',
      'Helpers - mustache',
      'Helpers - createCard',
      'Helpers - contextualCard',
      'Helpers - userCard',
      'Helpers - createTransaction',
      'Image - image',
      'Image - avatar',
      'Image - imageUrl',
      'Image - abstract',
      'Image - animals',
      'Image - business',
      'Image - cats',
      'Image - city',
      'Image - food',
      'Image - nightlife',
      'Image - fashion',
      'Image - people',
      'Image - nature',
      'Image - sports',
      'Image - technics',
      'Image - transport',
      'Image - dataUri',
      'Image - lorempixel',
      'Image - unsplash',
      'Image - lorempicsum',
      'Internet - avatar',
      'Internet - email',
      'Internet - exampleEmail',
      'Internet - userName',
      'Internet - protocol',
      'Internet - url',
      'Internet - domainName',
      'Internet - domainSuffix',
      'Internet - domainWord',
      'Internet - ip',
      'Internet - ipv6',
      'Internet - userAgent',
      'Internet - color',
      'Internet - mac',
      'Internet - password',
      'Lorem - word',
      'Lorem - words',
      'Lorem - sentence',
      'Lorem - slug',
      'Lorem - sentences',
      'Lorem - paragraph',
      'Lorem - paragraphs',
      'Lorem - text',
      'Lorem - lines',
      'Name - firstName',
      'Name - lastName',
      'Name - findName',
      'Name - jobTitle',
      'Name - gender',
      'Name - prefix',
      'Name - suffix',
      'Name - title',
      'Name - jobDescriptor',
      'Name - jobArea',
      'Name - jobType',
      'Phone - phoneNumber',
      'Phone - phoneNumberFormat',
      'Phone - phoneFormats',
      'Random - number',
      'Random - float',
      'Random - arrayElement',
      'Random - arrayElements',
      'Random - objectElement',
      'Random - uuid',
      'Random - boolean',
      'Random - word',
      'Random - words',
      'Random - image',
      'Random - locale',
      'Random - alpha',
      'Random - alphaNumeric',
      'Random - hexaDecimal',
      'System - fileName',
      'System - commonFileName',
      'System - mimeType',
      'System - commonFileType',
      'System - commonFileExt',
      'System - fileType',
      'System - fileExt',
      'System - directoryPath',
      'System - filePath',
      'System - semver',
      'Time - recent',
      'Vehicle - vehicle',
      'Vehicle - manufacturer',
      'Vehicle - model',
      'Vehicle - type',
      'Vehicle - fuel',
      'Vehicle - vin',
      'Vehicle - color',
    ],
    add : (val) => {
      this.state.data.dataType = val,
      this.state.data.data = {},
    },
  }
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

            
            {this.state.columns.forEach((elem, i) => {
              <div>
                Column Name:
                `<input type="text" name="colName${i}" onChange={(e)=>{this.setState({ columns[i].name : e})}}/>`

                Data Type:
                <select>
                  {typeOptions.dropdown.map((elem) => <option key={elem} onChange={(e)=>{this.setState({ columns[i].dataCategory : e} )}}>{elem}</option>)}
                </select>

                if (this.state.columns[i].dataCategory.length > 0) {
                  <select>
                  {typeOptions[this.state.columns[i].dataCategory].dropdown.map((elem) => <option key={elem} onChange={(e) => {typeOptions[this.state.columns[i].dataCategory].add(e, i)}}>{elem}</option>)}
                  </select>
                } 

                if (typeOptions[this.state.columns[i].dataCategory][this.state.columns[i].dataType].length) {
                  let output = ''
                  typeOptions[this.state.columns[i].dataCategory][this.state.columns[i].dataType].forEach((e, k)=> {
                    let localResult = '';
                    if (e.display) {
                      localResult = `${e.option}<input type="${e.type}" name={"option${k}"} onChange={(e)=>{${e.add}(e)}}/>`
                    }
                    output += localResult;
                  })
                  return output;
                }
              </div>
            })}


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