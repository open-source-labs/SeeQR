"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var ipcRenderer = window.require('electron').ipcRenderer;
var GenerateDataColumn_1 = __importDefault(require("./GenerateDataColumn"));
var GenerateData = /** @class */ (function (_super) {
    __extends(GenerateData, _super);
    function GenerateData(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            tables: ['TABLE', 'tables', 'tAbElZ'],
            currentTable: '',
            scale: 0,
            columns: [
                {
                    name: '',
                    dataCategory: '',
                    dataType: '',
                    data: {},
                },
                {
                    name: '',
                    dataCategory: '',
                    dataType: '',
                    data: {},
                }
            ],
        };
        // close modal function
        _this.onClose = function (event) {
            _this.props.onClose && _this.props.onClose(event);
        };
        _this.handleAddColumn = _this.handleAddColumn.bind(_this);
        _this.handleRemoveColumn = _this.handleRemoveColumn.bind(_this);
        _this.componentChangeState = _this.componentChangeState.bind(_this);
        _this.handleFormSubmit = _this.handleFormSubmit.bind(_this);
        return _this;
    }
    // ipcRenderer.on('db-lists', (event: any, returnedLists: any) => {
    //     this.setState({ dbLists: returnedLists.tableList })
    //   });
    GenerateData.prototype.handleAddColumn = function () {
        var columns = this.state.columns.columns;
        var newCol = {
            name: '',
            dataCategory: '',
            dataType: '',
            data: {},
        };
        columns.push(newCol);
        this.setState({ columns: columns });
    };
    GenerateData.prototype.handleRemoveColumn = function () {
        var columns = this.state.columns.columns;
        columns.pop();
        this.setState({ columns: columns });
    };
    GenerateData.prototype.componentChangeState = function (i, value, property, subProperty, format) {
        var columns = this.state.columns;
        var val;
        (format === "array") ? val = value.split(',') : val = value;
        (!subProperty) ? columns[i][property] = val : columns[i][property][subProperty];
        this.setState({ columns: columns });
    };
    GenerateData.prototype.handleFormSubmit = function (event) {
        event.preventDefault();
        // pass down any state from the form
        var formObj = {
            table: this.state.currentTable,
            scale: this.state.scale,
            columns: this.state.columns,
        };
        // on submit button click, sends form obj to backend
        ipcRenderer.send('form-input', formObj);
        console.log("sending " + formObj.table + " dataGen info to main process");
        this.setState({
            // tables : newTables,  
            currentTable: '',
            scale: 0,
            columns: [
                {
                    name: '',
                    dataCategory: '',
                    dataType: '',
                    data: {},
                }
            ],
        });
    };
    GenerateData.prototype.render = function () {
        var _this = this;
        var columns = [];
        this.state.columns.forEach(function (e, i) {
            columns.push(react_1.default.createElement(GenerateDataColumn_1.default, { key: "column" + i, columnIndex: i, columnObj: e, updateState: _this.componentChangeState }));
        });
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("form", { onSubmit: this.handleFormSubmit },
                react_1.default.createElement("div", { id: "modal-buttons" },
                    react_1.default.createElement("div", null, "Generate data on empty tables."),
                    react_1.default.createElement("div", null,
                        "Table:",
                        react_1.default.createElement("select", null, this.state.tables.map(function (elem) { return react_1.default.createElement("option", { key: elem, className: "DGI-tableName", onChange: function (e) { _this.setState({ currentTable: e }); } }, elem); }))),
                    react_1.default.createElement("div", null,
                        "Scale:",
                        react_1.default.createElement("input", { type: "number", className: "DGI-scale", name: "scale", min: "1", defaultValue: "# of records", onChange: function (e) { _this.setState({ scale: e }); } })),
                    react_1.default.createElement("div", null, columns),
                    react_1.default.createElement("div", { className: "actions" },
                        react_1.default.createElement("button", { className: "toggle-button", onClick: this.onClose }, "close"))))));
    };
    ;
    return GenerateData;
}(react_1.Component));
;
exports.default = GenerateData;
//# sourceMappingURL=GenerateData.js.map