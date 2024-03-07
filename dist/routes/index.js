"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const auth_1 = __importDefault(require("./auth"));
const users_1 = __importDefault(require("./users"));
const face_1 = __importDefault(require("./face"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
// These middlewares will be used for all routes below
router.use(middlewares_1.checkAuth);
router.use('/users', users_1.default);
router.use('/face', face_1.default);
exports.default = router;
