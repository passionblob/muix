"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsiveProvider = exports.ResponsiveContext = void 0;
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var utils_1 = require("@monthem/utils");
var getScreenInfo = function () {
    var _a = react_native_1.Dimensions.get("window"), curScreenWidth = _a.width, height = _a.height;
    return {
        height: height,
        width: curScreenWidth,
        os: react_native_1.Platform.OS,
    };
};
exports.ResponsiveContext = react_1.default.createContext(getScreenInfo());
var ResponsiveProvider = /** @class */ (function (_super) {
    __extends(ResponsiveProvider, _super);
    function ResponsiveProvider(props) {
        var _this = _super.call(this, props) || this;
        _this.handleResize = function () {
            var screenInfo = getScreenInfo();
            _this.setState(screenInfo);
        };
        _this.debouncedResizeHandler = utils_1.debounce(_this.handleResize, 100);
        _this.state = getScreenInfo();
        return _this;
    }
    ResponsiveProvider.prototype.componentDidMount = function () {
        if (react_native_1.Platform.OS === "web" && document !== undefined && window !== undefined) {
            window.addEventListener("resize", this.debouncedResizeHandler);
        }
        else {
            react_native_1.Dimensions.addEventListener("change", this.debouncedResizeHandler);
        }
    };
    ResponsiveProvider.prototype.componentWillUnmount = function () {
        if (react_native_1.Platform.OS === "web" && document !== undefined && window !== undefined) {
            window.removeEventListener("resize", this.debouncedResizeHandler);
        }
        else {
            react_native_1.Dimensions.removeEventListener("change", this.debouncedResizeHandler);
        }
    };
    ResponsiveProvider.prototype.render = function () {
        var _a = this, props = _a.props, state = _a.state;
        if (!state)
            return props.children;
        return (react_1.default.createElement(exports.ResponsiveContext.Provider, { value: state }, props.children));
    };
    return ResponsiveProvider;
}(react_1.default.Component));
exports.ResponsiveProvider = ResponsiveProvider;
