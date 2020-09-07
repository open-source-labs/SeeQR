const faker = require('faker');
const fakerLink = require('./../../../../backend/dummy_db/fakerLink');

export const typeOptions : any = {
    dropdown : ['unique', 'random'],
    unique : {
      dropdown : ['string', 'number'],
      // add : (val, i) => {
      //     const {columns} = this.state;
      //     if (val === 'sting') {columns[i].dataType = 'str'};
      //     // else if (val === 'number') columns[i].dataType = 'num';
      //     this.setState({ columns });
      //   },
      str : [
        {
          display : true,
          option : 'Minimum Length',
          type : 'text',
          // add : (val, i) => {
          //   const {columns} = this.state;
          //   columns[i].data.length[0] = val;
          //   this.setState({ columns });
          // },
        },
        {
          display : true,
          option : 'Maximum Length',
          type : 'text',
          // add : (val, i) => {
          //   const {columns} = this.state;
          //   columns[i].data.length[1] = val;
          //   this.setState({ columns });
          // },   
        },
        {
          display : true,
          option : 'Include lower case letters',
          type : 'checkbox',
          // add : (val, i) => {
          //   const {columns} = this.state;
          //   columns[i].data.inclAlphaLow = val;
          //   this.setState({ columns });
          // },
        },
        {
          display : true,
          option : 'Include upper case letters',
          type : 'checkbox',
          // add : (val, i) => {
          //   const {columns} = this.state;
          //   columns[i].data.inclAlphaUp = val;
          //   this.setState({ columns });
          // },
        },      
        {
          display : true,
          option : 'Include numbers',
          type : 'checkbox',
          // add : (val, i) => {
          //   const {columns} = this.state;
          //   columns[i].data.inclNum = val;
          //   this.setState({ columns });
          // },
        },      
        {
          display : true,
          option : 'Include spaces',
          type : 'checkbox',
          // add : (val, i) => {
          //   const {columns} = this.state;
          //   columns[i].data.inclSpaces = val;
          //   this.setState({ columns });
          // },
        },      
        {
          display : true,
          option : 'Include special characters',
          type : 'checkbox',
          // add : (val, i) => {
          //   const {columns} = this.state;
          //   columns[i].data.specChar= val;
          //   this.setState({ columns });
          // },
        },
        {
          display : true,
          option : 'Include these values (separate by commas)',
          type : 'text',
          // add : (val, i) => {
          //   const {columns} = this.state;
          //   columns[i].data.include = val;
          //   this.setState({ columns });
          // },
        },
      ],
      num : [
        {
          display : false,
          option : 'Serial',
          type : 'checkbox',
          // add : (val, i) => {
          //   const {columns} = this.state;
          //   columns[i].data.serial = val;
          //   this.setState({ columns });
          //   return;
          // }
        },
      ],
    },
    random : {
      // add : (val, i) => {
      //   const {columns} = this.state;
      //   columns[i].dataType = val;
      //   columns[i].data = {};
      //   this.setState({ columns });
      // },
      dropdown : Object.keys(fakerLink.fakeLink),
    },
  };