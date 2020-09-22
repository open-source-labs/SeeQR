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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var react_router_dom_1 = require("react-router-dom");
var dialog = require('electron').remote.dialog;
var fs = require('fs');
var ipcRenderer = window.require('electron').ipcRenderer;
var SchemaInput_1 = __importDefault(require("./SchemaInput"));
var GenerateData_1 = __importDefault(require("./GenerateData"));
var SchemaModal = /** @class */ (function (_super) {
    __extends(SchemaModal, _super);
    function SchemaModal(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            schemaName: '',
            schemaFilePath: '',
            schemaEntry: '',
            redirect: false,
        };
        _this.onClose = function (event) {
            _this.props.onClose && _this.props.onClose(event);
        };
        _this.handleSchemaSubmit = _this.handleSchemaSubmit.bind(_this);
        _this.handleSchemaFilePath = _this.handleSchemaFilePath.bind(_this);
        _this.handleSchemaEntry = _this.handleSchemaEntry.bind(_this);
        _this.handleSchemaName = _this.handleSchemaName.bind(_this);
        return _this;
        // this.handleQueryPrevious = this.handleQueryPrevious.bind(this);
        // this.handleQuerySubmit = this.handleQuerySubmit.bind(this);
    }
    // Set schema name
    SchemaModal.prototype.handleSchemaName = function (event) {
        // convert input label name to lowercase only with no spacing for db naming convention
        var schemaNameInput = event.target.value;
        var dbSafeName = schemaNameInput.toLowerCase();
        dbSafeName = dbSafeName.replace(/[^A-Z0-9]/gi, '');
        this.setState({ schemaName: dbSafeName });
    };
    // Load schema file path
    // When file path is uploaded, query entry is cleared (change to replaced by script later)
    // Add dialog box to warn user of this
    SchemaModal.prototype.handleSchemaFilePath = function (event) {
        var _this = this;
        event.preventDefault();
        dialog
            .showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Custom File Type', extensions: ['tar', 'sql'] }],
            message: 'Please upload .sql or .tar database file',
        })
            .then(function (result) {
            console.log('file uploaded', result);
            var filePath = result['filePaths'];
            _this.setState({ schemaFilePath: filePath });
            var schemaObj = {
                schemaName: _this.state.schemaName,
                schemaFilePath: _this.state.schemaFilePath,
                schemaEntry: '',
            };
            ipcRenderer.send('input-schema', schemaObj);
            console.log("sending " + schemaObj + " to main process");
            _this.onClose(event);
            // this.setState({ schemaEntry: '' });
        })
            .catch(function (err) {
            console.log(err);
        });
    };
    // when schema script is inserted, file path is cleared
    // set dialog to warn user
    SchemaModal.prototype.handleSchemaEntry = function (event) {
        this.setState({ schemaEntry: event.target.value });
        this.setState({ schemaFilePath: '' });
        console.log('schema entry: ', this.state.schemaEntry);
        console.log('schema entry type: ', typeof this.state.schemaEntry);
    };
    SchemaModal.prototype.handleSchemaSubmit = function (event) {
        event.preventDefault();
        var schemaObj = {
            schemaName: this.state.schemaName,
            schemaFilePath: this.state.schemaFilePath,
            schemaEntry: this.state.schemaEntry,
        };
        ipcRenderer.send('input-schema', schemaObj);
        console.log("sending " + schemaObj + " to main process");
    };
    SchemaModal.prototype.render = function () {
        var _this = this;
        if (!this.props.show) {
            return null;
        }
        return (react_1.default.createElement("div", { className: "modal", id: "modal" },
            react_1.default.createElement(react_router_dom_1.BrowserRouter, null,
                react_1.default.createElement("h3", null, "Load or input schema"),
                react_1.default.createElement("p", null,
                    "Schema Name (auto-formatted): ",
                    this.state.schemaName),
                react_1.default.createElement("input", { className: "schema-label", type: "text", placeholder: "Input schema label...", onChange: function (e) { return _this.handleSchemaName(e); } }),
                react_1.default.createElement("button", { onClick: this.handleSchemaFilePath }, "Load Schema"),
                react_1.default.createElement(react_router_dom_1.Link, { to: "/SchemaInput" },
                    react_1.default.createElement("button", null, "Input Schema")),
                react_1.default.createElement(react_router_dom_1.Link, { to: "/GenerateData" },
                    react_1.default.createElement("button", null, "GenerateData")),
                react_1.default.createElement("button", { className: "toggle-button", onClick: this.onClose }, "close"),
                react_1.default.createElement(react_router_dom_1.Switch, null,
                    react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/", component: SchemaModal }),
                    react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/SchemaInput", render: function (props) { return react_1.default.createElement(SchemaInput_1.default, __assign({}, props, { schemaName: _this.state.schemaName })); } }),
                    react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/GenerateData", component: GenerateData_1.default })))));
    };
    return SchemaModal;
}(react_1.Component));
// SchemaModal.propTypes = {
//   onClose: PropTypes.func.isRequired,
//   show: PropTypes.bool.isRequired
// };
exports.default = SchemaModal;
/*
<Route exact path="/" component={SchemaModal}/>
            <Route exact path="/SchemaInput" render={(props:any) => <SchemaInput {...props}/>}/>
            <Route exact path="/GenerateData" component={GenerateData} />
<div className="content">{this.props.children}</div>
          <h3>Load or input schema</h3>
          <form onSubmit={this.handleSchemaSubmit}>
            <p>First...</p>
            <input
              className="schema-label"
              type="text"
              placeholder="Input schema label..."
              onChange={(e) => this.handleSchemaName(e)}
            />
            <p>Schema label: {this.state.schemaName}</p>
            <br />
            <p>Then...</p>
            <button onClick={this.handleSchemaFilePath}>Load Schema</button>
            <p>{this.state.schemaFilePath}</p>
            <br />
            <p>Or...</p>
            <input
              className="schema-text-field"
              type="text"
              placeholder="Input Schema Here..."
              onChange={(e) => this.handleSchemaEntry(e)}
            />
            /* <input type="select" onClick={this.handleQueryPrevious}/> */
/*<div id="modal-buttons">
              <button>submit</button>
              <div className="actions">
                <button className="toggle-button" onClick={this.onClose}>
                  close
                </button>
              </div>
            </div>
          </form>
          <Route exact path="/SchemaInput" render={(props:any) => <SchemaInput {...props}/>}/>*/
//# sourceMappingURL=SchemaModal.js.map