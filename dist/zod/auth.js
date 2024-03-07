"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signInSchema = exports.signUpSchema = void 0;
const zod_1 = require("zod");
const generics_1 = require("./generics");
exports.signUpSchema = zod_1.z.object({
    name: generics_1.name,
    username: generics_1.username,
    email: generics_1.email,
    password: generics_1.password,
    bio: generics_1.bio,
});
exports.signInSchema = zod_1.z.object({
    identifier: zod_1.z
        .string({
        required_error: 'Username or email is required',
        invalid_type_error: 'Identifier must be a string',
    })
        .min(2)
        .max(255),
    password: generics_1.password,
});
