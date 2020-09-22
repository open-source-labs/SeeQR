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
var SchemaInput = /** @class */ (function (_super) {
    __extends(SchemaInput, _super);
    function SchemaInput(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            schemaEntry: '',
        };
        _this.onClose = function (event) {
            _this.props.onClose && _this.props.onClose(event);
        };
        _this.handleSchemaSubmit = _this.handleSchemaSubmit.bind(_this);
        _this.updateCode = _this.updateCode.bind(_this);
        return _this;
    }
    // Updates state.queryString as user inputs query string
    SchemaInput.prototype.updateCode = function (event) {
        this.setState({
            schemaEntry: event,
        });
        console.log('SCHEMA ENTRY', typeof this.state.schemaEntry);
    };
    SchemaInput.prototype.handleSchemaSubmit = function (event) {
        event.preventDefault();
        var schemaObj = {
            schemaName: this.props.schemaName,
            schemaFilePath: '',
            schemaEntry: this.state.schemaEntry,
        };
        ipcRenderer.send('input-schema', schemaObj);
        console.log("sending " + schemaObj + " to main process");
    };
    SchemaInput.prototype.render = function () {
        var _this = this;
        // Codemirror module configuration options
        var options = {
            lineNumbers: true,
            mode: 'sql',
            theme: 'lesser-dark',
        };
        return (react_1.default.createElement("div", { className: "input-schema" },
            react_1.default.createElement("form", { onSubmit: this.handleSchemaSubmit },
                react_1.default.createElement("br", null),
                react_1.default.createElement("div", { className: "codemirror" },
                    react_1.default.createElement(CodeMirror, { onChange: function (e) { _this.updateCode(e); }, options: options })),
                react_1.default.createElement("button", null, "submit"))));
    };
    return SchemaInput;
}(react_1.Component));
exports.default = SchemaInput;
//# sourceMappingURL=SchemaInput.js.map