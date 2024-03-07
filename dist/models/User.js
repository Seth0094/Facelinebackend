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
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Face_1 = __importDefault(require("./Face"));
const Like_1 = __importDefault(require("./Like"));
const Follow_1 = __importDefault(require("./Follow"));
const Block_1 = __importDefault(require("./Block"));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: 'https://firebasestorage.googleapis.com/v0/b/faceline-683f9.appspot.com/o?name=test%2F1709707492443.jpeg',
    },
}, {
    timestamps: true,
    versionKey: false,
});
UserSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password'))
            next();
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    });
});
UserSchema.pre('deleteOne', { document: true }, function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = this._id;
        yield Promise.all([
            Face_1.default.deleteMany({ userId }),
            Like_1.default.deleteMany({ userId }),
            Follow_1.default.deleteMany({ userId }),
            Follow_1.default.deleteMany({ followeeId: userId }),
            Block_1.default.deleteMany({ userId }),
            Block_1.default.deleteMany({ blockedId: userId }),
        ]);
        next();
    });
});
UserSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, this.password);
    });
};
UserSchema.methods.createToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id, username: this.username }, process.env.JWT_SECRET || 'secret');
};
UserSchema.methods.toSafeObject = function () {
    const { _id, name, username, email, bio, avatar, createdAt } = this;
    return { _id, name, username, email, bio, avatar, createdAt };
};
exports.default = (0, mongoose_1.model)('User', UserSchema);
