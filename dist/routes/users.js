"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const zod_1 = require("../zod");
const router = (0, express_1.Router)();
router
    .route('/me')
    .get(controllers_1.UsersController.getAuthUser)
    .delete(controllers_1.UsersController.deleteUser);
router.put('/me', (0, middlewares_1.validate)(zod_1.updateUserSchema), controllers_1.UsersController.updateUser);
router.put('/me/password', (0, middlewares_1.validate)(zod_1.updatePasswordSchema), controllers_1.UsersController.updatePassword);
router.get('/search', controllers_1.UsersController.searchUsers);
router.get('/:userId/followers', controllers_1.UsersController.getUserFollowers);
router.get('/:userId/following', controllers_1.UsersController.getUserFollowing);
router.post('/:userId/follow', controllers_1.UsersController.handleFollow);
router.post('/:userId/block', controllers_1.UsersController.handleBlock);
router.get('/:userId', controllers_1.UsersController.getUser);
exports.default = router;
