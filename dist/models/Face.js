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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FaceSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 400,
    },
    image: {
        type: String,
        trim: true,
        default: null,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isReplyTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'face',
        default: null,
    },
    isEdited: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// On face deleteone or delete many, delete all replies
FaceSchema.pre('deleteOne', { document: true }, function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.model('face').deleteMany({ isReplyTo: this._id });
    });
});
exports.default = (0, mongoose_1.model)('face', FaceSchema);
