"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = exports.FacelineController = exports.AuthController = void 0;
const AuthController_1 = __importDefault(require("./AuthController"));
exports.AuthController = AuthController_1.default;
const FacelineController_1 = __importDefault(require("./FacelineController"));
exports.FacelineController = FacelineController_1.default;
const UsersController_1 = __importDefault(require("./UsersController"));
exports.UsersController = UsersController_1.default;
