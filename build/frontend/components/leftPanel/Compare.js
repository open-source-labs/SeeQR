"use strict";
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
exports.Compare = void 0;
var react_1 = __importStar(require("react"));
var DropdownButton_1 = __importDefault(require("react-bootstrap/DropdownButton"));
var Dropdown_1 = __importDefault(require("react-bootstrap/Dropdown"));
var ipcRenderer = window.require('electron').ipcRenderer;
var react_chartjs_2_1 = require("react-chartjs-2");
react_chartjs_2_1.defaults.global.defaultFontColor = 'rgb(198,210,213)';
exports.Compare = function (props) {
    var initial = __assign(__assign({}, props), { compareList: [] });
    var _a = react_1.useState(initial), queryInfo = _a[0], setCompare = _a[1];
    var addCompareQuery = function (event) {
        var compareList = queryInfo.compareList;
        props.queries.forEach(function (query) {
            if (query.queryLabel === event.target.text) {
                compareList.push(query);
            }
        });
        setCompare(__assign(__assign({}, queryInfo), { compareList: compareList }));
    };
    var deleteCompareQuery = function (event) {
        var compareList = queryInfo.compareList.filter(function (query) { return query.queryLabel !== event.target.id; });
        setCompare(__assign(__assign({}, queryInfo), { compareList: compareList }));
    };
    var dropDownList = function () {
        return props.queries.map(function (query, index) { return react_1.default.createElement(Dropdown_1.default.Item, { key: index, className: "queryItem", onClick: addCompareQuery }, query.queryLabel); });
    };
    var renderCompare = function () {
        return queryInfo.compareList.map(function (query, index) {
            var queryString = query.queryString, queryData = query.queryData, queryStatistics = query.queryStatistics, querySchema = query.querySchema, queryLabel = query.queryLabel;
            var queryPlan = queryStatistics[0]["QUERY PLAN"];
            var _a = queryPlan[0], Plan = _a.Plan, planningTime = _a["Planning Time"], executionTime = _a["Execution Time"];
            var scanType = Plan["Node Type"], actualRows = Plan["Actual Rows"], actualStartupTime = Plan["Actual Startup Time"], actualTotalTime = Plan["Actual Total Time"], loops = Plan["Actual Loops"];
            var runtime = (planningTime + executionTime).toFixed(3);
            return (react_1.default.createElement("tr", { key: index },
                react_1.default.createElement("td", { id: 'label' }, queryLabel),
                react_1.default.createElement("td", { id: "schema-name" }, querySchema),
                react_1.default.createElement("td", { id: "actual-rows" }, actualRows),
                react_1.default.createElement("td", { id: "runtime" }, runtime),
                react_1.default.createElement("td", { id: 'time-al' }, actualTotalTime),
                react_1.default.createElement("button", { id: queryLabel, className: "delete-query-button", onClick: deleteCompareQuery }, "X")));
        });
    };
    var compareList = queryInfo.compareList;
    var labelData = function () { return compareList.map(function (query) { return query.queryLabel; }); };
    var runtimeData = function () { return compareList.map(function (query) { return query.queryStatistics[0]["QUERY PLAN"][0]["Execution Time"] + query.queryStatistics[0]["QUERY PLAN"][0]["Planning Time"]; }); };
    var data = {
        labels: labelData(),
        datasets: [
            {
                label: 'Runtime',
                backgroundColor: 'rgb(108, 187, 169)',
                borderColor: 'rgba(247,247,247,247)',
                borderWidth: 2,
                data: runtimeData(),
            }
        ]
    };
    return (react_1.default.createElement("div", { id: "compare-panel" },
        react_1.default.createElement("h3", null, "Comparisons"),
        react_1.default.createElement(DropdownButton_1.default, { id: "add-query-button", title: "Add Query Data \u23F7" }, dropDownList()),
        react_1.default.createElement("div", { className: "compare-container" },
            react_1.default.createElement("table", { className: "compare-box" },
                react_1.default.createElement("tbody", null,
                    react_1.default.createElement("tr", { className: "top-row" },
                        react_1.default.createElement("td", null, 'Query Label'),
                        react_1.default.createElement("td", null, 'Schema'),
                        react_1.default.createElement("td", null, 'Total Rows'),
                        react_1.default.createElement("td", null, 'Runtime (ms)'),
                        react_1.default.createElement("td", null, 'Total Time')),
                    renderCompare()))),
        react_1.default.createElement("div", { className: "bar-chart" },
            react_1.default.createElement(react_chartjs_2_1.Bar, { data: data, options: {
                    title: {
                        display: true,
                        text: 'QUERY LABEL VS RUNTIME (ms)',
                        fontSize: 16
                    },
                    legend: {
                        display: false,
                        position: 'right'
                    }
                } }))));
};
//# sourceMappingURL=Compare.js.map