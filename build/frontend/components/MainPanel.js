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
var Compare_1 = require("./leftPanel/Compare");
var History_1 = __importDefault(require("./leftPanel/History"));
// import { SchemaContainer } from './rightPanel/SchemaContainer';
var Tabs_1 = require("./rightPanel/Tabs");
var ipcRenderer = window.require('electron').ipcRenderer;
var MainPanel = /** @class */ (function (_super) {
    __extends(MainPanel, _super);
    function MainPanel(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            queries: [],
            // currentSchema will change depending on which Schema Tab user selects
            currentSchema: 'defaultDB',
            dbLists: {
                databaseList: ['defaultDB'],
                tableList: [],
            }
        };
        _this.onClickTabItem = _this.onClickTabItem.bind(_this);
        return _this;
    }
    MainPanel.prototype.componentDidMount = function () {
        var _this = this;
        // Listening for returnedData from executing Query
        // Update state with new object (containing query data, query statistics, query schema
        // inside of state.queries array
        ipcRenderer.on('return-execute-query', function (event, returnedData) {
            console.log('returnedData', returnedData);
            // destructure from returnedData from backend
            var queryString = returnedData.queryString, queryData = returnedData.queryData, queryStatistics = returnedData.queryStatistics, queryCurrentSchema = returnedData.queryCurrentSchema, queryLabel = returnedData.queryLabel;
            // create new query object with returnedData
            var newQuery = {
                queryString: queryString,
                queryData: queryData,
                queryStatistics: queryStatistics,
                querySchema: queryCurrentSchema,
                queryLabel: queryLabel,
            };
            // create copy of current queries array
            var queries = _this.state.queries.slice();
            // push new query object into copy of queries array
            queries.push(newQuery);
            _this.setState({ queries: queries });
        });
        ipcRenderer.on('db-lists', function (event, returnedLists) {
            _this.setState({ dbLists: returnedLists });
            console.log('DB LIST CHECK !', _this.state.dbLists);
        });
    };
    MainPanel.prototype.onClickTabItem = function (tabName) {
        var _this = this;
        ipcRenderer.send('change-db', tabName);
        ipcRenderer.on('return-change-db', function (event, db_name) {
            _this.setState({ currentSchema: tabName });
        });
    };
    MainPanel.prototype.render = function () {
        return (react_1.default.createElement("div", { id: "main-panel" },
            react_1.default.createElement("div", { id: "main-left" },
                react_1.default.createElement(History_1.default, { queries: this.state.queries, currentSchema: this.state.currentSchema }),
                react_1.default.createElement(Compare_1.Compare, { queries: this.state.queries, currentSchema: this.state.currentSchema })),
            react_1.default.createElement(Tabs_1.Tabs, { currentSchema: this.state.currentSchema, tabList: this.state.dbLists.databaseList, queries: this.state.queries, onClickTabItem: this.onClickTabItem })));
    };
    return MainPanel;
}(react_1.Component));
exports.default = MainPanel;
//# sourceMappingURL=MainPanel.js.map