"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_dom_1 = require("react-dom");
var App_1 = require("./components/App");
require("./assets/stylesheets/css/style.css");
require('codemirror/lib/codemirror.css');
var root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);
react_dom_1.render(react_1.default.createElement("div", null,
    react_1.default.createElement(App_1.App, null)), document.getElementById('root'));
//# sourceMappingURL=index.js.map