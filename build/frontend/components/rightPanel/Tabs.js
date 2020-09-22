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
exports.Tabs = void 0;
var react_1 = __importStar(require("react"));
var Tab_1 = require("./tabsChildren/Tab");
var SchemaContainer_1 = require("./SchemaContainer");
var SchemaModal_1 = __importDefault(require("./schemaChildren/SchemaModal"));
var Tabs = /** @class */ (function (_super) {
    __extends(Tabs, _super);
    function Tabs(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            show: false,
        };
        _this.showModal = function (event) {
            _this.setState({ show: !_this.state.show });
        };
        _this.showModal = _this.showModal.bind(_this);
        return _this;
    }
    Tabs.prototype.render = function () {
        var _this = this;
        var _a = this.props, onClickTabItem = _a.onClickTabItem, tabList = _a.tabList, currentSchema = _a.currentSchema, queries = _a.queries;
        var activeTabQueries = queries.filter(function (query) { return query.querySchema === currentSchema; });
        return (react_1.default.createElement("div", { className: "tabs", id: "main-right" },
            react_1.default.createElement("ol", { className: "tab-list" },
                react_1.default.createElement("span", null, tabList.map(function (tab, index) {
                    return (react_1.default.createElement(Tab_1.Tab, { currentSchema: currentSchema, key: index, label: tab, onClickTabItem: onClickTabItem }));
                })),
                react_1.default.createElement("span", null,
                    react_1.default.createElement("button", { id: "input-schema-button", onClick: function (e) {
                            _this.showModal(e);
                        } }, "+"))),
            react_1.default.createElement(SchemaModal_1.default, { show: this.state.show, onClose: this.showModal }),
            react_1.default.createElement("div", { className: "tab-content" }, tabList.map(function (tab, index) {
                if (tab !== currentSchema)
                    return undefined;
                return react_1.default.createElement(SchemaContainer_1.SchemaContainer, { key: index, queries: activeTabQueries, currentSchema: currentSchema });
            }))));
    };
    return Tabs;
}(react_1.Component));
exports.Tabs = Tabs;
//# sourceMappingURL=Tabs.js.map