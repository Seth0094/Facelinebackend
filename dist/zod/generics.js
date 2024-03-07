"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bio = exports.password = exports.email = exports.username = exports.name = void 0;
const zod_1 = require("zod");
exports.name = zod_1.z
    .string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string',
})
    .min(2, 'Name must be at least 2 characters')
    .max(30, 'Name must be at most 30 characters');
exports.username = zod_1.z
    .string({
    required_error: 'Username is required',
    invalid_type_error: 'Username must be a string',
})
    .min(2, 'Username must be at least 2 characters')
    .max(25, 'Username must be at most 25 characters');
exports.email = zod_1.z
    .string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string',
})
    .email('Invalid email format');
exports.password = zod_1.z
    .string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string',
})
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password must be at most 50 characters')
    .regex(/^(?=.*[A-Z])(?=.*\d).+/, 'Password must contain at least one uppercase letter and one number');
exports.bio = zod_1.z
    .string({
    invalid_type_error: 'Bio must be a string',
})
    .max(100, 'Bio must be at most 100 characters')
    .optional();
