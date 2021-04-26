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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Identity = void 0;
var react_1 = __importDefault(require("react"));
var Identity = /** @class */ (function (_super) {
    __extends(Identity, _super);
    function Identity() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Identity.prototype.render = function () {
        var _a = this.props, props = _a.props, component = _a.component, children = _a.children, ref = _a.ref;
        if (component === undefined)
            return children;
        return react_1.default.createElement(component, __assign(__assign({}, props), { ref: ref }), children);
    };
    return Identity;
}(react_1.default.Component));
exports.Identity = Identity;
exports.default = Identity;
