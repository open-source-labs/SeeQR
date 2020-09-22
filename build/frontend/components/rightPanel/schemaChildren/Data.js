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
exports.Data = void 0;
var react_1 = __importStar(require("react"));
var DataTable_1 = require("./dataChildren/DataTable");
var Data = /** @class */ (function (_super) {
    __extends(Data, _super);
    function Data(props) {
        return _super.call(this, props) || this;
    }
    Data.prototype.render = function () {
        var queries = this.props.queries;
        return (react_1.default.createElement("div", { id: "data-panel" },
            react_1.default.createElement("br", null),
            react_1.default.createElement("br", null),
            react_1.default.createElement("br", null),
            react_1.default.createElement("br", null),
            react_1.default.createElement("h3", { id: "results-title" }, "Data Table"),
            react_1.default.createElement("div", { id: "data-table" }, queries.length === 0 ? null : react_1.default.createElement(DataTable_1.Table, { queries: queries }))));
    };
    return Data;
}(react_1.Component));
exports.Data = Data;
//# sourceMappingURL=Data.js.map