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
exports.App = void 0;
var react_1 = __importStar(require("react"));
var Splash_1 = require("./Splash");
var MainPanel_1 = __importDefault(require("./MainPanel"));
var dialog = require('electron').remote.dialog;
var ipcRenderer = window.require('electron').ipcRenderer;
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            openSplash: true,
        };
        _this.handleFileClick = _this.handleFileClick.bind(_this);
        _this.handleSkipClick = _this.handleSkipClick.bind(_this);
        return _this;
    }
    App.prototype.handleFileClick = function (event) {
        var _this = this;
        dialog
            .showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Custom File Type', extensions: ['tar', 'sql'] }],
            message: 'Please upload .sql or .tar database file'
        })
            .then(function (result) {
            var filePathArr = result["filePaths"];
            // send via channel to main process
            if (!result["canceled"]) {
                ipcRenderer.send('upload-file', filePathArr);
                _this.setState({ openSplash: false });
            }
        })
            .catch(function (err) {
            console.log(err);
        });
    };
    App.prototype.handleSkipClick = function (event) {
        ipcRenderer.send('skip-file-upload');
        this.setState({ openSplash: false });
    };
    App.prototype.render = function () {
        var _this = this;
        // listen for menu to invoke handleFileClick
        ipcRenderer.on('menu-upload-file', function () {
            _this.handleFileClick;
        });
        return (react_1.default.createElement("div", null, this.state.openSplash ? (react_1.default.createElement(Splash_1.Splash, { openSplash: this.state.openSplash, handleFileClick: this.handleFileClick, handleSkipClick: this.handleSkipClick })) : (react_1.default.createElement(MainPanel_1.default, null))));
    };
    return App;
}(react_1.Component));
exports.App = App;
//# sourceMappingURL=App.js.map