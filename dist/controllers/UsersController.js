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
class UsersController extends BaseController_1.default {
    constructor() {
        super(...arguments);
        this.updatePassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.user._id;
            const { oldPassword, newPassword } = req.body;
            try {
                const user = yield models_1.User.findById(userId);
                if (user == null) {
                    return this.errorRes(res, 404, 'User not found');
                }
                const isMatch = yield user.comparePassword(oldPassword);
                if (!isMatch) {
                    return this.errorRes(res, 400, 'Invalid password');
                }
                user.password = newPassword;
                yield user.save();
                return this.successRes(res, 200, 'Password updated');
            }
            catch (error) {
                return this.errorRes(res, 500, 'Error updating password', error);
            }
        });
        this.getUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const authUserId = req.user._id;
            try {
                const user = yield (0, models_1.userPipeline)(authUserId)
                    .match({ _id: new mongoose_1.Types.ObjectId(userId) })
                    .exec();
                if (user.length === 0) {
                    return this.errorRes(res, 404, 'User not found');
                }
                return this.successRes(res, 200, 'User retrieved', user[0]);
            }
            catch (error) {
                return this.errorRes(res, 500, 'Error getting user', error);
            }
        });
        this.getAuthUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.user._id;
            try {
                const user = yield (0, models_1.userPipeline)()
                    .match({ _id: new mongoose_1.Types.ObjectId(userId) })
                    .exec();
                if (user.length === 0) {
                    return this.errorRes(res, 404, 'User not found');
                }
                return this.successRes(res, 200, 'User retrieved', user[0]);
            }
            catch (error) {
                console.log(error);
                return this.errorRes(res, 500, 'Error getting user', error);
            }
        });
        this.updateUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { name, username, avatar, bio } = req.body;
            const userId = req.user._id;
            try {
                const user = yield models_1.User.findOne({ _id: userId });
                if (user == null) {
                    return this.errorRes(res, 404, 'User not found');
                }
                user.name = name !== null && name !== void 0 ? name : user.name;
                user.username = username !== null && username !== void 0 ? username : user.username;
                user.avatar = avatar !== null && avatar !== void 0 ? avatar : user.avatar;
                user.bio = bio !== null && bio !== void 0 ? bio : user.bio;
                yield user.save();
                return this.successRes(res, 200, 'User updated', user.toSafeObject());
            }
            catch (error) {
                return this.errorRes(res, 500, 'Error updating user', error);
            }
        });
        this.deleteUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.user._id;
            try {
                const user = yield models_1.User.findOne({ _id: userId });
                if (user == null) {
                    return this.errorRes(res, 404, 'User not found');
                }
                yield user.deleteOne();
                return this.successRes(res, 200, 'Account deleted');
            }
            catch (error) {
                return this.errorRes(res, 500, 'Error deleting user', error);
            }
        });
        this.searchUsers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { query, date } = req.query;
            if (!query) {
                return this.errorRes(res, 400, 'Query cannot be empty');
            }
            try {
                const userPipelineBuilder = (0, models_1.userPipeline)()
                    .match({
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { username: { $regex: query, $options: 'i' } },
                    ],
                })
                    .sort({ createdAt: -1 });
                if (date) {
                    userPipelineBuilder.match({
                        createdAt: { $lt: new Date(date) },
                    });
                }
                const users = yield userPipelineBuilder.limit(10).exec();
                return this.successRes(res, 200, 'Users retrieved', users);
            }
            catch (error) {
                console.log(error);
                return this.errorRes(res, 500, 'Error getting users', error);
            }
        });
        this.getUserFollowers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const { date } = req.query;
            try {
                const user = models_1.User.exists({ _id: userId });
                if (!user) {
                    return this.errorRes(res, 404, 'User not found');
                }
                const followerPipelineBuilder = models_1.Follow.find({ followingId: userId })
                    .populate({
                    path: 'userId',
                    select: '-password -email -createdAt -updatedAt',
                })
                    .select('-_id userId')
                    .sort({ createdAt: -1 });
                if (date) {
                    followerPipelineBuilder.where({
                        createdAt: { $lt: new Date(date) },
                    });
                }
                const followers = yield followerPipelineBuilder.limit(10).exec();
                const followersRes = followers.map((user) => user.userId);
                return this.successRes(res, 200, 'Followers retrieved', followersRes);
            }
            catch (error) {
                return this.errorRes(res, 500, 'Error getting followers', error);
            }
        });
        this.getUserFollowing = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const { date } = req.query;
            try {
                const user = models_1.User.exists({ _id: userId });
                if (!user) {
                    return this.errorRes(res, 404, 'User not found');
                }
                const followingPipelineBuilder = models_1.Follow.find({ userId })
                    .populate({
                    path: 'followingId',
                    select: '-password -email -createdAt -updatedAt',
                })
                    .select('-_id followingId')
                    .sort({ createdAt: -1 });
                if (date) {
                    followingPipelineBuilder.where({
                        createdAt: { $lt: new Date(date) },
                    });
                }
                const following = yield followingPipelineBuilder.limit(10).exec();
                const followingRes = following.map((follow) => follow.followingId);
                return this.successRes(res, 200, 'Following retrieved', followingRes);
            }
            catch (error) {
                return this.errorRes(res, 500, 'Error getting following', error);
            }
        });
        this.handleFollow = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const authUserId = req.user._id;
            if (userId === authUserId.toString()) {
                return this.errorRes(res, 400, 'Cannot follow yourself');
            }
            try {
                const user = models_1.User.exists({ _id: userId });
                if (!user) {
                    return this.errorRes(res, 404, 'User not found');
                }
                const follow = yield models_1.Follow.findOne({
                    followingId: userId,
                    userId: authUserId,
                });
                if (follow != null) {
                    yield follow.deleteOne();
                    return this.successRes(res, 200, 'User unfollowed', follow);
                }
                const isBlocked = yield models_1.Block.findOne({
                    blockedUserId: userId,
                    userId: authUserId,
                });
                if (isBlocked != null) {
                    return this.errorRes(res, 400, 'Cannot follow a blocked user');
                }
                const hasMeBlocked = yield models_1.Block.findOne({
                    blockedUserId: authUserId,
                    userId,
                });
                if (hasMeBlocked != null) {
                    return this.errorRes(res, 400, 'Cannot follow a user that blocked you');
                }
                yield models_1.Follow.create({
                    followingId: userId,
                    userId: authUserId,
                });
                return this.successRes(res, 200, 'User followed');
            }
            catch (error) {
                return this.errorRes(res, 500, 'Error following user', error);
            }
        });
        this.handleBlock = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const authUserId = req.user._id;
            if (userId === authUserId.toString()) {
                return this.errorRes(res, 400, 'Cannot block yourself');
            }
            try {
                const user = models_1.User.exists({ _id: userId });
                if (!user) {
                    return this.errorRes(res, 404, 'User not found');
                }
                const block = yield models_1.Block.findOne({
                    blockedUserId: userId,
                    userId: authUserId,
                });
                if (block != null) {
                    yield block.deleteOne();
                    return this.successRes(res, 200, 'User unblocked', block);
                }
                const following = yield models_1.Follow.findOne({
                    followingId: userId,
                    userId: authUserId,
                });
                if (following != null) {
                    yield following.deleteOne();
                }
                const isFollowingMe = yield models_1.Follow.findOne({
                    followingId: authUserId,
                    userId,
                });
                if (isFollowingMe != null) {
                    yield isFollowingMe.deleteOne();
                }
                yield models_1.Block.create({
                    blockedUserId: userId,
                    userId: authUserId,
                });
                return this.successRes(res, 200, 'User blocked');
            }
            catch (error) {
                return this.errorRes(res, 500, 'Error blocking user', error);
            }
        });
    }
}
exports.default = new UsersController();
