"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omit = exports.pick = exports.keysOf = exports.pickKeysOfType = void 0;
var pickKeysOfType = function () {
    var keys = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keys[_i] = arguments[_i];
    }
    return keys;
};
exports.pickKeysOfType = pickKeysOfType;
var keysOf = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.map(function (obj) { return Object.keys(obj || {}); })
        .reduce(function (acc, ele) { return acc.concat(ele); });
};
exports.keysOf = keysOf;
var pick = function (target, keys) {
    return Object.keys(target)
        .filter(function (key) { return keys.includes(key); })
        .reduce(function (acc, key) {
        var assertedKey = key;
        acc[assertedKey] = target[assertedKey];
        return acc;
    }, {});
};
exports.pick = pick;
var omit = function (target, keys) {
    var remainingKeys = Object.keys(target)
        .filter(function (key) { return !keys.includes(key); });
    return exports.pick(target, remainingKeys);
};
exports.omit = omit;
