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
exports.History = void 0;
var react_1 = __importStar(require("react"));
var ipcRenderer = window.require('electron').ipcRenderer;
var History = /** @class */ (function (_super) {
    __extends(History, _super);
    function History(props) {
        return _super.call(this, props) || this;
    }
    History.prototype.renderTableHistory = function () {
        return this.props.queries.map(function (query, index) {
            var queryStatistics = query.queryStatistics, querySchema = query.querySchema, queryLabel = query.queryLabel;
            var queryPlan = queryStatistics[0]["QUERY PLAN"];
            var _a = queryPlan[0], Plan = _a.Plan, planningTime = _a["Planning Time"], executionTime = _a["Execution Time"];
            var actualRows = Plan["Actual Rows"], actualTotalTime = Plan["Actual Total Time"];
            return (react_1.default.createElement("tr", { key: index },
                react_1.default.createElement("td", { id: "query-label" }, queryLabel),
                react_1.default.createElement("td", { id: "schema-name" }, querySchema),
                react_1.default.createElement("td", { id: "actual-rows" }, actualRows),
                react_1.default.createElement("td", { id: "total-time" }, actualTotalTime)));
        });
    };
    History.prototype.render = function () {
        var queries = this.props.queries;
        return (react_1.default.createElement("div", { id: "history-panel" },
            react_1.default.createElement("h3", null, "History"),
            react_1.default.createElement("div", { className: "history-container" },
                react_1.default.createElement("table", { className: "scroll-box" },
                    react_1.default.createElement("tbody", null,
                        react_1.default.createElement("tr", { className: "top-row" },
                            react_1.default.createElement("td", null, 'Query Label'),
                            react_1.default.createElement("td", null, 'Schema'),
                            react_1.default.createElement("td", null, 'Total Rows'),
                            react_1.default.createElement("td", null, 'Total Time')),
                        this.renderTableHistory())))));
    };
    return History;
}(react_1.Component));
exports.History = History;
exports.default = History;
//# sourceMappingURL=History.js.map