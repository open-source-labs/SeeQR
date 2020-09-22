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
exports.Splash = void 0;
var react_1 = __importStar(require("react"));
var path = require('path');
var Splash = /** @class */ (function (_super) {
    __extends(Splash, _super);
    // a dialogue menu with retrieve the file path
    function Splash(props) {
        return _super.call(this, props) || this;
    }
    Splash.prototype.render = function () {
        return (react_1.default.createElement("div", { id: "splash-page" },
            react_1.default.createElement("div", { className: "logo" }),
            react_1.default.createElement("div", { className: "splash-prompt" },
                react_1.default.createElement("h4", null, "Welcome!"),
                react_1.default.createElement("h4", null, "Import database in .sql or .tar?")),
            react_1.default.createElement("div", { className: "splash-buttons" },
                react_1.default.createElement("button", { onClick: this.props.handleSkipClick }, "Skip"),
                react_1.default.createElement("button", { onClick: this.props.handleFileClick }, "Yes"))));
    };
    return Splash;
}(react_1.Component));
exports.Splash = Splash;
//# sourceMappingURL=Splash.js.map