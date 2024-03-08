"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const zod_1 = require("../zod");
const router = (0, express_1.Router)();
router.post('/', (0, middlewares_1.validate)(zod_1.createFaceSchema), controllers_1.FacelineController.createFace);
router.get('/recent', controllers_1.FacelineController.getRecentfaces);
router.get('/following', controllers_1.FacelineController.getFollowingfaces);
router.get('/search', controllers_1.FacelineController.searchfaces);
router.get('/user/:userId', controllers_1.FacelineController.getUserfaces);
router.get('/user/:userId/replies', controllers_1.FacelineController.getUserReplies);
router.get('/user/:userId/liked', controllers_1.FacelineController.getUserLikedfaces);
router.post('/:faceId/reply', (0, middlewares_1.validate)(zod_1.createFaceSchema), controllers_1.FacelineController.createFace);
router.get('/:faceId/replies', controllers_1.FacelineController.getfaceReplies);
router.post('/:faceId/like', controllers_1.FacelineController.handleLike);
router
    .route('/:faceId')
    .get(controllers_1.FacelineController.getface)
    .delete(controllers_1.FacelineController.deleteface);
router.put('/:faceId', (0, middlewares_1.validate)(zod_1.updateFaceSchema), controllers_1.FacelineController.updateface);
exports.default = router;
