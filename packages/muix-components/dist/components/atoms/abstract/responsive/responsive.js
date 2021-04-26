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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Responsive = void 0;
var react_1 = __importStar(require("react"));
var providers_1 = require("@monthem/muix/providers");
var deepmerge_1 = __importDefault(require("deepmerge"));
var Responsive = /** @class */ (function (_super) {
    __extends(Responsive, _super);
    function Responsive(props) {
        var _this = _super.call(this, props) || this;
        _this.getTargetPoint = function (screenInfo) {
            var breakpoints = _this.props.breakpoints;
            var keys = Object.keys(breakpoints || {});
            var targetPoint = keys
                .map(function (key) {
                var _a;
                return [key, Number((_a = key.match(/\d/g)) === null || _a === void 0 ? void 0 : _a.join("")) || 0];
            })
                .sort(function (a, b) {
                return b[1] - a[1];
            })
                .find(function (breakpoint) {
                return breakpoint[1] < screenInfo.width;
            });
            if (!targetPoint)
                throw Error("Something is wrong with breakpoints");
            return targetPoint[0];
        };
        return _this;
    }
    Responsive.prototype.render = function () {
        var _this = this;
        var _a = this.props, breakpoints = _a.breakpoints, component = _a.component, children = _a.children, _b = _a.commonProps, commonProps = _b === void 0 ? {} : _b;
        return (react_1.default.createElement(providers_1.ResponsiveContext.Consumer, null, function (screenInfo) {
            var targetPoint = _this.getTargetPoint(screenInfo);
            var targetProps = breakpoints[targetPoint];
            var _props = deepmerge_1.default(commonProps, targetProps);
            return react_1.default.createElement(component, _props, children);
        }));
    };
    Responsive.contextType = providers_1.ResponsiveContext;
    return Responsive;
}(react_1.Component));
exports.Responsive = Responsive;
exports.default = Responsive;
