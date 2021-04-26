"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttle = void 0;
function throttle(event, interval) {
    var lastExecutionTimestamp = Date.now();
    var triggered = false;
    return function () {
        var now = Date.now();
        if (!triggered) {
            lastExecutionTimestamp = now;
            event();
        }
        else if (now - lastExecutionTimestamp >= interval) {
            triggered = false;
        }
    };
}
exports.throttle = throttle;
