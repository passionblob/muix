"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = void 0;
function debounce(event, delay) {
    var timeout = setTimeout(event, delay);
    return function () {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(event, delay);
    };
}
exports.debounce = debounce;
