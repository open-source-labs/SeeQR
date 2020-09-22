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
var typeOptions = require('./GenerateObj').typeOptions;
var GenerateDataColumn = /** @class */ (function (_super) {
    __extends(GenerateDataColumn, _super);
    function GenerateDataColumn(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        return _this;
    }
    GenerateDataColumn.prototype.render = function () {
        var _this = this;
        console.log('======');
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("div", null,
                "Column Name:",
                react_1.default.createElement("input", { type: "text", className: "DGI-columnName" })),
            react_1.default.createElement("div", null,
                "Data Type:",
                react_1.default.createElement("select", { className: "DGI-dataType" }, typeOptions.dropdown.map(function (elem) { return react_1.default.createElement("option", { key: elem, onChange: function (e) { _this.props.updateState(_this.props.key, e, 'dataCategory', false, false); } }, elem); })),
                react_1.default.createElement(DataType, { key: "datatype" + this.props.columnIndex, columnIndex: this.props.columnIndex, columnObj: this.props.columnObj, updateState: this.props.updateState }))));
    };
    ;
    return GenerateDataColumn;
}(react_1.Component));
;
var DataType = /** @class */ (function (_super) {
    __extends(DataType, _super);
    function DataType(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        return _this;
    }
    DataType.prototype.render = function () {
        var _this = this;
        var message = react_1.default.createElement("div", null);
        if (typeOptions[this.props.columnObj.dataCategory] && typeOptions[this.props.columnObj.dataCategory].message) {
            message = react_1.default.createElement("div", { className: "DGI-message" }, typeOptions[this.props.columnObj.dataCategory].message);
            return (react_1.default.createElement("div", null,
                "DATA TYPE----",
                react_1.default.createElement("select", { className: "DGI-dataType" }, typeOptions[this.props.columnObj.dataCategory].dropdown(function (elem) { react_1.default.createElement("option", { key: elem, onChange: function (e) { _this.props.updateState(_this.props.key, e, 'dataType', false, false); } }, elem); })),
                message));
        }
        else {
            return (react_1.default.createElement("div", null));
        }
    };
    ;
    return DataType;
}(react_1.Component));
;
/*===================== DATAOPTIONS SUB COMPONENT =====================*/
// type DataOptionsState = {};
// class DataOptions extends Component<Props, DataOptionsState> {
//   constructor(props: Props) {
//     super(props);
//   }
//   state: DataOptionsState = {};
//   render() { 
//     let dataOptions : Array<any> = [];
//       typeOptions[this.props.columnObj.dataCategory][this.props.columnObj.dataType].forEach( option => {
//         if (!option.display) this.props.updateState(this.props.key, option.value, 'data', option.location, option.format);
//         else {
//           dataOptions.push(<div>{option.option}: <input type={option.type} onChange={(e)=>{this.props.updateState(this.props.key, e, 'data', option.location, option.format)}}/></div>)
//         }
//       })
//     return (
//       <div>
//         { dataOptions }
//       </div>
//     );
//   };
// };
exports.default = GenerateDataColumn;
//# sourceMappingURL=GenerateDataColumn.js.map