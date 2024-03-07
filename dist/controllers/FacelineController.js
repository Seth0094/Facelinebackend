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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseController_1 = __importDefault(require("./BaseController"));
const models_1 = require("../models");
const mongoose_1 = require("mongoose");
class FacelineController extends BaseController_1.default {
    constructor() {
        super(...arguments);
        this.createFace = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { content, image } = req.body;
            const { faceId } = req.params;
            const userId = req.user._id;
            try {
                const face = yield models_1.Face.create({
                    content,
                    image: image !== null && image !== void 0 ? image : null,
                    userId,
                    isReplyTo: faceId !== null && faceId !== void 0 ? faceId : null,
                });
                yield face.save();
                return this.successRes(res, 201, 'face created', face);
            }
            catch (error) {
                return this.errorRes(res, 500, 'Failed to create face', error);
            }
        });
        this.getface = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { faceId } = req.params;
            const userId = req.user._id;
            try {
                const face = yield (0, models_1.facePipeline)(null, userId)
                    .match({ _id: new mongoose_1.Types.ObjectId(faceId) })
                    .exec();
                if (face.length === 0) {
                    return this.errorRes(res, 404, 'face not found');
                }
                return this.successRes(res, 200, 'face retrieved', face[0]);
            }
            catch (error) {
                return this.errorRes(res, 500, 'Failed to get face', error);
            }
        });
        this.updateface = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { content, image } = req.body;
            const { faceId } = req.params;
            const userId = req.user._id;
            try {
                const face = yield models_1.Face.findOne({ _id: faceId });
                if (face == null) {
                    return this.errorRes(res, 404, 'face not found');
                }
                if (!face.userId.equals(userId)) {
                    return this.errorRes(res, 403, 'You do not possess permissions to update this face');
                }
                face.content = content !== null && content !== void 0 ? content : face.content;
                face.image = image !== null && image !== void 0 ? image : face.image;
                face.isEdited = true;
                yield face.save();
                return this.successRes(res, 200, 'face updated', face);
            }
            catch (error) {
                return this.errorRes(res, 500, 'Failed to update face', error);
            }
        });
        this.deleteface = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { faceId } = req.params;
            try {
                const face = yield models_1.Face.findOne({ _id: faceId });
                const userId = req.user._id;
                if (face == null) {
                    return this.errorRes(res, 404, 'face not found');
                }
                if (!face.userId.equals(userId)) {
                    return this.errorRes(res, 403, 'You do not possess permissions to delete this face');
                }
                // Find all faces that have isReplyTo set to this face id and delete them
                yield models_1.Face.deleteMany({ isReplyTo: faceId });
                yield face.deleteOne();
                return this.successRes(res, 200, 'face deleted', face);
            }
            catch (error) {
                return this.errorRes(res, 500, 'Failed to delete face', error);
            }
        });
        this.getRecentfaces = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.user._id;
            const { date } = req.query;
            try {
                const myBlocks = yield models_1.Block.find({ userId });
                const blocksMe = yield models_1.Block.find({ blockedUserId: userId });
                const blockedUserIds = myBlocks.map((block) => block.blockedUserId);
                const blockedByUserIds = blocksMe.map((block) => block.userId);
                const facePipelineBuilder = (0, models_1.facePipeline)(null, userId)
                    .match({
                    $and: [
                        { 'user._id': { $nin: blockedUserIds } },
                        { 'user._id': { $nin: blockedByUserIds } },
                        { isReplyTo: null },
                    ],
                })
                    .sort({ createdAt: -1 });
                if (date) {
                    facePipelineBuilder.match({
                        createdAt: { $lt: new Date(date) },
                    });
                }
                const faces = yield facePipelineBuilder.limit(10).exec();
                return this.successRes(res, 200, 'Recent faces retrieved', faces);
            }
            catch (error) {
                return this.errorRes(res, 500, 'Failed to get recent faces', error);
            }
        });
        this.getFollowingfaces = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.user._id;
            const { date } = req.query;
            try {
                const following = yield models_1.Follow.find({ userId }).select('followingId');
                const followingUserIds = following.map((follow) => follow.followingId);
                console.log(followingUserIds);
                const facePipelineBuilder = (0, models_1.facePipeline)(null, userId)
                    .match({ 'user._id': { $in: followingUserIds } })
                    .match({ isReplyTo: null })
                    .sort({ createdAt: -1 });
                if (date) {
                    facePipelineBuilder.match({
                        createdAt: { $lt: new Date(date) },
                    });
                }
                const faces = yield facePipelineBuilder.limit(10).exec();
                return this.successRes(res, 200, 'Following faces retrieved', faces);
            }
            catch (error) {
                return this.errorRes(res, 500, 'Failed to get following faces', error);
            }
        });
        this.getfaceReplies = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { faceId } = req.params;
            const userId = req.user._id;
            const { date } = req.query;
            try {
                const facePipelineBuilder = (0, models_1.facePipeline)(null, userId)
                    .match({
                    isReplyTo: new mongoose_1.Types.ObjectId(faceId),
                })
                    .sort({ createdAt: -1 });
                if (date) {
                    facePipelineBuilder.match({
                        createdAt: { $lt: new Date(date) },
                    });
                }
                const faceReplies = yield facePipelineBuilder.limit(10).exec();
                return this.successRes(res, 200, 'face replies retrieved', faceReplies);
            }
            catch (error) {
                return this.errorRes(res, 500, 'Failed to get face replies', error);
            }
        });
        this.getUserfaces = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const authUserId = req.user._id;
            const { date } = req.query;
            try {
                const user = models_1.User.exists({ _id: userId });
                if (!user) {
                    return this.errorRes(res, 404, 'User not found');
                }
                const facePipelineBuilder = (0, models_1.facePipeline)(null, authUserId)
                    .match({
                    'user._id': new mongoose_1.Types.ObjectId(userId),
                    isReplyTo: null,
                })
                    .sort({ createdAt: -1 });
                if (date) {
                    facePipelineBuilder.match({
                        createdAt: { $lt: new Date(date) },
                    });
                }
                const faces = yield facePipelineBuilder.limit(10).exec();
                return this.successRes(res, 200, 'faces from user retrieved', faces);
            }
            catch (error) {
                return this.errorRes(res, 500, 'Error getting faces', error);
            }
        });
        this.getUserLikedfaces = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const authUserId = req.user._id;
            const { date } = req.query;
            try {
                const user = models_1.User.exists({ _id: userId });
                if (!user) {
                    return this.errorRes(res, 404, 'User not found');
                }
                const facePipelineBuilder = (0, models_1.facePipeline)({
                    'likes.userId': new mongoose_1.Types.ObjectId(userId),
                }, authUserId).sort({ createdAt: -1 });
                if (date) {
                    facePipelineBuilder.match({
                        createdAt: { $lt: new Date(date) },
                    });
                }
                const faces = yield facePipelineBuilder.limit(10).exec();
                return this.successRes(res, 200, 'Liked faces from user retrieved', faces);
            }
            catch (error) {
                return this.errorRes(res, 500, 'Error getting liked faces', error);
            }
        });
        this.getUserReplies = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const authUserId = req.user._id;
            const { date } = req.query;
            try {
                const user = models_1.User.exists({ _id: userId });
                if (!user) {
                    return this.errorRes(res, 404, 'User not found');
                }
                const facePipelineBuilder = (0, models_1.facePipeline)(null, authUserId)
                    .match({
                    'user._id': new mongoose_1.Types.ObjectId(userId),
                    isReplyTo: { $ne: null },
                })
                    .sort({
                    createdAt: -1,
                });
                if (date) {
                    facePipelineBuilder.match({
                        createdAt: { $lt: new Date(date) },
                    });
                }
                const faces = yield facePipelineBuilder.limit(10).exec();
                return this.successRes(res, 200, 'Replies from user retrieved', faces);
            }
            catch (error) {
                return this.errorRes(res, 500, 'Error getting replies', error);
            }
        });
        this.searchfaces = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { query, filter, page } = req.query;
            const userId = req.user._id;
            if (!query) {
                return this.errorRes(res, 400, 'Query cannot be empty');
            }
            try {
                const myBlocks = yield models_1.Block.find({ userId });
                const blocksMe = yield models_1.Block.find({ blockedUserId: userId });
                const blockedUserIds = myBlocks.map((block) => block.blockedUserId);
                const blockedByUserIds = blocksMe.map((block) => block.userId);
                const facePipelineBuilder = (0, models_1.facePipeline)(null, userId).match({
                    $and: [
                        { content: { $regex: query, $options: 'i' } },
                        { 'user._id': { $nin: blockedUserIds } },
                        { 'user._id': { $nin: blockedByUserIds } },
                        { isReplyTo: null },
                    ],
                });
                if (filter) {
                    switch (filter) {
                        case 'latest':
                            facePipelineBuilder.sort({ createdAt: -1 });
                            break;
                        case 'oldest':
                            facePipelineBuilder.sort({ createdAt: 1 });
                            break;
                        case 'popular':
                            facePipelineBuilder.sort({ likeCount: -1 });
                            break;
                        case 'media':
                            facePipelineBuilder
                                .match({
                                $and: [{ image: { $ne: null } }, { image: { $ne: '' } }],
                            })
                                .sort({ createdAt: -1 });
                            break;
                        default:
                            break;
                    }
                }
                const faces = yield facePipelineBuilder
                    .skip(10 * (parseInt(page) - 1))
                    .limit(10)
                    .exec();
                return this.successRes(res, 200, 'faces retrieved', faces);
            }
            catch (error) {
                console.error(error);
                return this.errorRes(res, 500, 'Failed to get faces', error);
            }
        });
        this.handleLike = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { faceId } = req.params;
                const userId = req.user._id;
                const like = yield models_1.Like.findOne({ userId, faceId });
                if (like != null) {
                    yield like.deleteOne();
                    return this.successRes(res, 200, 'face unliked', like);
                }
                yield models_1.Like.create({ userId, faceId });
                return this.successRes(res, 200, 'face liked');
            }
            catch (error) {
                return this.errorRes(res, 500, 'Failed to like face', error);
            }
        });
    }
}
exports.default = new FacelineController();
