"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOptions = void 0;
var faker = require('faker');
var fakerLink = require('./../../../../backend/dummy_db/fakerLink');
exports.typeOptions = {
    dropdown: ['Select one', 'unique', 'random'],
    unique: {
        dropdown: ['str', 'num'],
        str: [
            {
                display: true,
                option: 'Minimum Length',
                type: 'text',
                location: 'minLen',
                format: "false",
            },
            {
                display: true,
                option: 'Maximum Length',
                type: 'text',
                location: 'maxLen',
                format: "false",
            },
            {
                display: true,
                option: 'Include lower case letters',
                type: 'checkbox',
                location: 'inclAlphaLow',
                format: "false",
            },
            {
                display: true,
                option: 'Include upper case letters',
                type: 'checkbox',
                location: 'inclAlphaUp',
                format: "false",
            },
            {
                display: true,
                option: 'Include numbers',
                type: 'checkbox',
                location: 'inclNum',
                format: "false",
            },
            {
                display: true,
                option: 'Include spaces',
                type: 'checkbox',
                location: 'inclSpaces',
                format: "false",
            },
            {
                display: true,
                option: 'Include special characters',
                type: 'checkbox',
                location: "specChar",
                format: "false",
            },
            {
                display: true,
                option: 'Include these values (separate by commas)',
                type: 'text',
                location: 'include',
                format: "array",
            },
        ],
        num: [
            {
                display: false,
                option: 'Serial',
                type: 'checkbox',
                location: "serial",
                format: "false",
                value: true,
            },
        ],
    },
    random: {
        dropdown: Object.keys(fakerLink.fakerLink),
        message: 'For a sample of each random data type, please visit the Faker.js demo.'
    },
};
//# sourceMappingURL=GenerateObj.js.map