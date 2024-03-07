"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const passport_1 = __importDefault(require("passport"));
function checkAuth(req, res, next) {
    passport_1.default.authenticate('jwt', { session: false }, (err, user) => {
        if (err) {
            // Handle errors, e.g., log them or send a server error response
            console.error(err);
            return res
                .status(500)
                .json({ status: 'error', message: 'Internal Server Error' });
        }
        if (!user) {
            // Custom unauthorized response
            return res.status(401).json({
                status: 'error',
                message: 'You are not authorized to access this resource',
            });
        }
        // Authentication successful, store the user in the request
        req.user = user;
        next();
    })(req, res, next);
}
exports.checkAuth = checkAuth;
