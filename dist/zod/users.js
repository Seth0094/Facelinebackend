"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePasswordSchema = exports.updateUserSchema = void 0;
const zod_1 = require("zod");
const generics_1 = require("./generics");
exports.updateUserSchema = zod_1.z
    .object({
    name: generics_1.name,
    username: generics_1.username,
    bio: generics_1.bio,
    avatar: zod_1.z.string().url({ message: 'Avatar must be a valid URL' }),
})
    .partial()
    .superRefine(({ name, username, bio }, ctx) => {
    if (!name && !username && !bio) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'At least one field must be provided',
            path: ['name', 'username', 'bio'],
        });
    }
});
exports.updatePasswordSchema = zod_1.z
    .object({
    oldPassword: generics_1.password,
    newPassword: generics_1.password,
    confirmNewPassword: generics_1.password,
})
    .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
    if (newPassword !== confirmNewPassword) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Password must match new password',
            path: ['confirmNewPassword'],
        });
    }
});
