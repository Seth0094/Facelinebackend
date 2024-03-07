"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseController_1 = __importDefault(require("./BaseController"));
const models_1 = require("../models");
class AuthController extends BaseController_1.default {
    constructor() {
        super(...arguments);
        this.signUp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, username, email, password, bio } = req.body;
                const userExists = yield models_1.User.exists({ username });
                if (userExists !== null) {
                    return this.errorRes(res, 400, 'Username is already taken');
                }
                const emailExists = yield models_1.User.exists({ email });
                if (emailExists !== null) {
                    return this.errorRes(res, 400, 'Account with email already exists');
                }
                const user = yield models_1.User.create({
                    name,
                    username,
                    email,
                    password,
                    bio: bio !== null && bio !== void 0 ? bio : '',
                });
                return this.successRes(res, 201, 'User created', user.toSafeObject());
            }
            catch (error) {
                console.log(error);
                return this.errorRes(res, 500, 'Internal server error');
            }
        });
        this.signIn = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { identifier, password } = req.body;
            try {
                const user = yield models_1.User.findOne({
                    $or: [{ username: identifier }, { email: identifier }],
                });
                if (user == null) {
                    return this.errorRes(res, 404, 'User not found');
                }
                const isMatch = yield user.comparePassword(password);
                if (!isMatch) {
                    return this.errorRes(res, 400, 'Invalid password');
                }
                const token = user.createToken();
                return this.successRes(res, 200, 'User logged in', {
                    token,
                    userId: user._id,
                });
            }
            catch (error) {
                return this.errorRes(res, 500, 'Internal server error');
            }
        });
    }
}
exports.default = new AuthController();
