"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAllTrue = void 0;
var isAllTrue = function (bools) {
    for (var i = 0; i < bools.length; i += 1) {
        if (!bools[i])
            return false;
    }
    return true;
};
exports.isAllTrue = isAllTrue;
