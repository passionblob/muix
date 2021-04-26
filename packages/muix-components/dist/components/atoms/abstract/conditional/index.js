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
exports.Conditional = void 0;
var react_1 = __importDefault(require("react"));
var identity_1 = require("../identity");
var deepmerge_1 = __importDefault(require("deepmerge"));
var Conditional = /** @class */ (function (_super) {
    __extends(Conditional, _super);
    function Conditional() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Conditional.prototype.render = function () {
        var _a = this.props, shouldRender = _a.shouldRender, defaultProps = _a.defaultProps, commonProps = _a.commonProps, cases = _a.cases, component = _a.component, children = _a.children;
        if (!shouldRender)
            return null;
        if (defaultProps === undefined)
            throw new Error("should provide defaultProps");
        var satisfyingCase = cases === null || cases === void 0 ? void 0 : cases.find(function (_a) {
            var bool = _a[0];
            return bool === true;
        });
        var propForCase = satisfyingCase ? satisfyingCase[1] : defaultProps || {};
        var mergedProps = deepmerge_1.default(commonProps || {}, propForCase);
        return (react_1.default.createElement(identity_1.Identity, { props: mergedProps, component: component, children: children }));
    };
    return Conditional;
}(react_1.default.Component));
exports.Conditional = Conditional;
