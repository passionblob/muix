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
exports.GridBase = void 0;
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var GridBase = /** @class */ (function (_super) {
    __extends(GridBase, _super);
    function GridBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridBase.prototype.render = function () {
        var _a = this.props, _b = _a.column, columnCount = _b === void 0 ? 3 : _b, shouldRenderEmpty = _a.shouldRenderEmpty, _c = _a.cellStyle, cellStyle = _c === void 0 ? {} : _c, _d = _a.rowStyle, rowStyle = _d === void 0 ? {} : _d, _e = _a.items, items = _e === void 0 ? [] : _e, renderItem = _a.renderItem, keyExtractor = _a.keyExtractor, containerStyle = _a.containerStyle, _f = _a.marginBetweenColumns, marginBetweenColumns = _f === void 0 ? 8 : _f, _g = _a.marginBetweenRows, marginBetweenRows = _g === void 0 ? 8 : _g;
        var children = this.props.children
            ? react_1.default.Children.toArray(this.props.children)
            : renderItem && items.map(renderItem)
                || [];
        var _shouldRenderEmpty = (function () {
            if (shouldRenderEmpty !== undefined)
                return shouldRenderEmpty;
            return children.length > columnCount;
        })();
        var rowCount = Math.ceil(children.length / columnCount);
        var rows = Array(rowCount).fill(0).map(function (_, i) {
            var from = i * columnCount;
            var to = (i + 1) * columnCount;
            var rowItems = items.slice(from, to)
                .map(function (item, j) { return (__assign({ index: i * columnCount + j }, item)); });
            var isNotStartOfRows = i > 0;
            var shouldRenderMarginRow = isNotStartOfRows && marginBetweenRows;
            var _rowStyle = react_native_1.StyleSheet.flatten([
                styles.row,
                shouldRenderMarginRow ? { marginTop: marginBetweenRows } : {},
                typeof rowStyle === "function"
                    ? items && rowStyle(rowItems, i)
                    : rowStyle
            ]);
            return (react_1.default.createElement(react_native_1.View, { key: "grid_base_row_" + i, style: _rowStyle }, Array(columnCount).fill(0).map(function (_, j) {
                var flatIndex = i * columnCount + j;
                var child = children[flatIndex];
                var item = items && items[flatIndex];
                var key = (item && keyExtractor)
                    ? keyExtractor(item, j)
                    : "gridbase_" + flatIndex;
                var isNotStartOfColumns = j > 0;
                var shouldRenderMarginColumn = isNotStartOfColumns && marginBetweenColumns;
                var _cellStyle = react_native_1.StyleSheet.flatten([
                    styles.cell,
                    shouldRenderMarginColumn ? { marginLeft: marginBetweenColumns } : {},
                    typeof cellStyle === "function"
                        ? item && cellStyle(item, flatIndex)
                        : cellStyle
                ]);
                if (!child && !_shouldRenderEmpty)
                    return null;
                return (react_1.default.createElement(react_native_1.View, { key: key, style: _cellStyle, children: child }));
            })));
        });
        var _containerStyle = react_native_1.StyleSheet.flatten([
            styles.container,
            containerStyle,
        ]);
        return (react_1.default.createElement(react_native_1.View, { style: _containerStyle, children: rows }));
    };
    return GridBase;
}(react_1.default.Component));
exports.GridBase = GridBase;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
    row: {
        flex: 1,
        flexDirection: "row"
    },
    cell: {
        flex: 1,
    }
});
