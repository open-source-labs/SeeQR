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
exports.Table = void 0;
var react_1 = __importStar(require("react"));
var Table = /** @class */ (function (_super) {
    __extends(Table, _super);
    function Table(props) {
        var _this = _super.call(this, props) || this;
        _this.getKeys = _this.getKeys.bind(_this);
        _this.getHeader = _this.getHeader.bind(_this);
        _this.getRowsData = _this.getRowsData.bind(_this);
        return _this;
    }
    // Returns list of headings that should be displayed @ top of table
    Table.prototype.getKeys = function () {
        var queries = this.props.queries;
        // All keys will be consistent across each object in queryData,
        // so we only need to list keys of first object in data returned
        // from backend.
        return Object.keys(queries[queries.length - 1].queryData[0]);
    };
    // Create Header by generating a <th> element for each key.
    Table.prototype.getHeader = function () {
        var keys = this.getKeys();
        return keys.map(function (key, index) {
            return react_1.default.createElement("th", { key: key }, key.toUpperCase());
        });
    };
    // Iterate through queryData array to return the body part of the table.
    Table.prototype.getRowsData = function () {
        var queries = this.props.queries;
        var items = queries[queries.length - 1].queryData;
        // console.log('items', items); // [ {}, {}, {} ]
        var keys = this.getKeys(); // actor_id, firstName, lastName, lastUpdated
        return items.map(function (row, index) {
            return react_1.default.createElement("tr", { key: index },
                react_1.default.createElement(RenderRow, { key: index, data: row, keys: keys }));
        });
    };
    Table.prototype.render = function () {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("table", null,
                react_1.default.createElement("thead", null,
                    react_1.default.createElement("tr", null, this.getHeader())),
                react_1.default.createElement("tbody", null, this.getRowsData()))));
    };
    return Table;
}(react_1.Component));
exports.Table = Table;
// Returns each cell within table
var RenderRow = function (props) {
    var data = props.data, keys = props.keys;
    // console.log('data', data);
    return keys.map(function (header, index) {
        // turn all values in data object to string or number
        data[header] = JSON.stringify(data[header]);
        return react_1.default.createElement("td", { key: index }, data[header]);
    });
};
//# sourceMappingURL=DataTable.js.map