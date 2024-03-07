"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.checkAuth = exports.passportMiddleware = void 0;
const passport_1 = __importDefault(require("./passport"));
exports.passportMiddleware = passport_1.default;
const checkAuth_1 = require("./checkAuth");
Object.defineProperty(exports, "checkAuth", { enumerable: true, get: function () { return checkAuth_1.checkAuth; } });
const validator_1 = require("./validator");
Object.defineProperty(exports, "validate", { enumerable: true, get: function () { return validator_1.validate; } });
