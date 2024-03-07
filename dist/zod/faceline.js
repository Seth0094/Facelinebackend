"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFaceSchema = exports.createFaceSchema = void 0;
const zod_1 = require("zod");
exports.createFaceSchema = zod_1.z.object({
    content: zod_1.z
        .string({
        required_error: 'Content is required',
        invalid_type_error: 'Content must be a string',
    })
        .max(400, 'Content must be at most 400 characters'),
    image: zod_1.z
        .string({
        invalid_type_error: 'Image must be a string',
    })
        .optional(),
});
exports.updateFaceSchema = exports.createFaceSchema
    .partial()
    .superRefine(({ content, image }, ctx) => {
    if (!content && !image) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'At least one field must be provided',
            path: ['content', 'image'],
        });
    }
});
