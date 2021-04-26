"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anyOf = exports.getInitialValue = void 0;
function getInitialValue(values) {
    return values.find(function (val) { return val !== undefined; });
}
exports.getInitialValue = getInitialValue;
function anyOf(values) {
    return values.find(function (val) { return !!val; });
}
exports.anyOf = anyOf;
