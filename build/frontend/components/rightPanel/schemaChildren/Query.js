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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var ipcRenderer = window.require('electron').ipcRenderer;
var dialog = require('electron').remote.dialog;
// Codemirror Styling
require('codemirror/lib/codemirror.css');
// Codemirror Languages
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');
// Codemirror Themes
require('codemirror/mode/markdown/markdown');
require('codemirror/theme/monokai.css');
require('codemirror/theme/midnight.css');
require('codemirror/theme/lesser-dark.css');
require('codemirror/theme/solarized.css');
// Codemirror Component
var CodeMirror = require('react-codemirror');
var Query = /** @class */ (function (_super) {
    __extends(Query, _super);
    function Query(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            queryString: '',
            queryLabel: '',
            show: false,
        };
        _this.handleQuerySubmit = _this.handleQuerySubmit.bind(_this);
        // this.handleQueryEntry = this.handleQueryEntry.bind(this);
        // this.showModal = this.showModal.bind(this);
        // this.handleQueryPrevious = this.handleQueryPrevious.bind(this);
        _this.updateCode = _this.updateCode.bind(_this);
        return _this;
    }
    // Updates state.queryString as user inputs query label
    Query.prototype.handleLabelEntry = function (event) {
        this.setState({ queryLabel: event.target.value });
    };
    // Updates state.queryString as user inputs query string
    Query.prototype.updateCode = function (newQueryString) {
        this.setState({
            queryString: newQueryString,
        });
    };
    // Submits query to backend on 'execute-query' channel
    Query.prototype.handleQuerySubmit = function (event) {
        event.preventDefault();
        // if input fields for query label or query string are empty, then
        // send alert to input both fields
        if (!this.state.queryLabel || !this.state.queryString) {
            var noInputAlert = dialog.showErrorBox('Please enter a Label and a Query.', '');
        }
        else {
            var queryAndSchema = {
                queryString: this.state.queryString,
                queryCurrentSchema: this.props.currentSchema,
                queryLabel: this.state.queryLabel,
            };
            ipcRenderer.send('execute-query', queryAndSchema);
            // this.setState({ queryString: '' });
        }
    };
    Query.prototype.handleGenerateData = function (event) {
        ipcRenderer.send('generate-data');
    };
    Query.prototype.render = function () {
        var _this = this;
        // Codemirror module configuration options
        var options = {
            lineNumbers: true,
            mode: 'sql',
            theme: 'lesser-dark',
        };
        return (react_1.default.createElement("div", { id: "query-panel" },
            react_1.default.createElement("h3", null, "Query"),
            react_1.default.createElement("form", { onSubmit: this.handleQuerySubmit },
                react_1.default.createElement("label", null, "Query Label:* "),
                react_1.default.createElement("input", { className: "label-field", type: "text", placeholder: "enter label for query", onChange: function (e) { return _this.handleLabelEntry(e); } }),
                react_1.default.createElement("br", null),
                react_1.default.createElement("br", null),
                react_1.default.createElement("label", null, "Query:*"),
                react_1.default.createElement("div", { className: "codemirror" },
                    react_1.default.createElement(CodeMirror, { onChange: this.updateCode, options: options })),
                react_1.default.createElement("button", null, "Submit"),
                react_1.default.createElement("br", null),
                react_1.default.createElement("br", null),
                react_1.default.createElement("p", null, "*required")),
            react_1.default.createElement("button", { id: "generate-data-button", onClick: this.handleGenerateData }, "Generate Dummy Data")));
    };
    return Query;
}(react_1.Component));
exports.default = Query;
//# sourceMappingURL=Query.js.map