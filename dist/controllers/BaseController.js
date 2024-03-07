"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseController {
    successRes(res, statusCode = 200, message, data) {
        if (!data) {
            return res.status(statusCode).json({
                status: 'success',
                message,
            });
        }
        return res.status(statusCode).json({
            status: 'success',
            message,
            data,
        });
    }
    errorRes(res, statusCode = 400, message, errors) {
        if (!errors) {
            return res.status(statusCode).json({
                status: 'error',
                message,
            });
        }
        return res.status(statusCode).json({
            status: 'error',
            message,
            errors,
        });
    }
}
exports.default = BaseController;
