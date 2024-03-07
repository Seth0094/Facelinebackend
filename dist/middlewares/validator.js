"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
// TODO: Parse params
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation error',
                    errors: error.issues.map((issue) => ({
                        path: issue.path,
                        message: issue.message,
                    })),
                });
            }
            return res
                .status(500)
                .json({ status: 'error', message: 'Internal server error', error });
        }
    };
};
exports.validate = validate;
