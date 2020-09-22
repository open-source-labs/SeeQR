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
exports.Results = void 0;
var react_1 = __importStar(require("react"));
var react_chartjs_2_1 = require("react-chartjs-2");
react_chartjs_2_1.defaults.global.defaultFontColor = 'rgb(198,210,213)';
var Results = /** @class */ (function (_super) {
    __extends(Results, _super);
    function Results(props) {
        return _super.call(this, props) || this;
    }
    Results.prototype.renderTableData = function () {
        return this.props.queries.map(function (query, index) {
            // destructure state from mainPanel, including destructuring object returned from Postgres
            var queryString = query.queryString, queryData = query.queryData, queryStatistics = query.queryStatistics, querySchema = query.querySchema, queryLabel = query.queryLabel;
            var queryPlan = queryStatistics[0]["QUERY PLAN"];
            var _a = queryPlan[0], Plan = _a.Plan, planningTime = _a["Planning Time"], executionTime = _a["Execution Time"];
            var scanType = Plan["Node Type"], actualRows = Plan["Actual Rows"], actualStartupTime = Plan["Actual Startup Time"], actualTotalTime = Plan["Actual Total Time"], loops = Plan["Actual Loops"];
            var runtime = (planningTime + executionTime).toFixed(3);
            return (react_1.default.createElement("tr", { key: index },
                react_1.default.createElement("td", { id: 'label' }, queryLabel),
                react_1.default.createElement("td", { id: "query-string" }, queryString),
                react_1.default.createElement("td", { id: 'planning-time' }, planningTime),
                react_1.default.createElement("td", { id: "runtime" }, runtime),
                react_1.default.createElement("td", { id: "loops" }, loops)));
        });
    };
    Results.prototype.render = function () {
        var queries = this.props.queries;
        var labelData = function () { return queries.map(function (query) { return query.queryLabel; }); };
        var runtimeData = function () { return queries.map(function (query) { return query.queryStatistics[0]["QUERY PLAN"][0]["Execution Time"] + query.queryStatistics[0]["QUERY PLAN"][0]["Planning Time"]; }); };
        var data = {
            labels: labelData(),
            datasets: [
                {
                    label: 'Runtime',
                    fill: false,
                    lineTension: 0.5,
                    backgroundColor: 'rgb(108, 187, 169)',
                    borderColor: 'rgba(247,247,247,247)',
                    borderWidth: 2,
                    data: runtimeData(),
                }
            ]
        };
        return (react_1.default.createElement("div", { id: "results-panel" },
            react_1.default.createElement("h3", null, "Results"),
            react_1.default.createElement("div", { className: "results-container" },
                react_1.default.createElement("table", { id: "results" },
                    react_1.default.createElement("tbody", null,
                        react_1.default.createElement("tr", { className: "top-row" },
                            react_1.default.createElement("td", null, 'Query Label'),
                            react_1.default.createElement("td", null, 'Query'),
                            react_1.default.createElement("td", null, 'Planning Time'),
                            react_1.default.createElement("td", null, 'Runtime (ms)'),
                            react_1.default.createElement("td", null, 'Loops')),
                        this.renderTableData()))),
            react_1.default.createElement("div", { className: "line-chart" },
                react_1.default.createElement(react_chartjs_2_1.Line, { data: data, options: {
                        title: {
                            display: true,
                            text: 'QUERY LABEL VS RUNTIME (ms)',
                            fontSize: 16,
                        },
                        legend: {
                            display: false,
                            position: 'right'
                        }
                    } }))));
    };
    return Results;
}(react_1.Component));
exports.Results = Results;
//# sourceMappingURL=Results.js.map