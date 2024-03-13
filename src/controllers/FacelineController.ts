import BaseController from './BaseController';
import type { Request, Response } from 'express';
import { Face , Follow, Like, Block, facePipeline, User } from '../models';
import type { AuthRequest } from '../interfaces';
import { Types } from 'mongoose';

class FacelineController extends BaseController {
  createFace = async (req: Request, res: Response): Promise<Response> => {
    const { content, image } = req.body;
    const { faceId } = req.params;
    const userId = (req as AuthRequest).user._id;

    try {
      const face = await Face.create({
        content,
        image: image ?? [],
        userId,
        isReplyTo: faceId ?? null,
      });

      await face.save();

      return this.successRes(res, 201, 'face created', face);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to create face', error);
    }
  };

  getface = async (req: Request, res: Response): Promise<Response> => {
    const { faceId } = req.params;
    const userId = (req as AuthRequest).user._id;

    try {
      const face = await facePipeline(null, userId)
        .match({ _id: new Types.ObjectId(faceId) })
        .exec();

      if (face.length === 0) {
        return this.errorRes(res, 404, 'face not found');
      }

      return this.successRes(res, 200, 'face retrieved', face[0]);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to get face', error);
    }
  };

  updateface = async (req: Request, res: Response): Promise<Response> => {
    const { content, image } = req.body;
    const { faceId } = req.params;
    const userId = (req as AuthRequest).user._id;

    try {
      const face = await Face.findOne({ _id: faceId });

      if (face == null) {
        return this.errorRes(res, 404, 'face not found');
      }

      if (!face.userId.equals(userId)) {
        return this.errorRes(
          res,
          403,
          'You do not possess permissions to update this face',
        );
      }

      face.content = content ?? face.content;
      face.image = image ?? face.image; 
      face.isEdited = true;

      await face.save();

      return this.successRes(res, 200, 'face updated', face);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to update face', error);
    }
  };

  deleteface = async (req: Request, res: Response): Promise<Response> => {
    const { faceId } = req.params;

    try {
      const face = await Face.findOne({ _id: faceId });
      const userId = (req as AuthRequest).user._id;

      if (face == null) {
        return this.errorRes(res, 404, 'face not found');
      }

      if (!face.userId.equals(userId)) {
        return this.errorRes(
          res,
          403,
          'You do not possess permissions to delete this face',
        );
      }

      // Find all faces that have isReplyTo set to this face id and delete them
      await Face.deleteMany({ isReplyTo: faceId });
      await face.deleteOne();

      return this.successRes(res, 200, 'face deleted', face);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to delete face', error);
    }
  };

  getRecentfaces = async (req: Request, res: Response): Promise<Response> => {
    const userId = (req as AuthRequest).user._id;
    const { date } = req.query;

    try {
      const myBlocks = await Block.find({ userId });
      const blocksMe = await Block.find({ blockedUserId: userId });

      const blockedUserIds = myBlocks.map((block) => block.blockedUserId);
      const blockedByUserIds = blocksMe.map((block) => block.userId);

      const facePipelineBuilder = facePipeline(null, userId)
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
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const faces = await facePipelineBuilder.limit(10).exec();

      return this.successRes(res, 200, 'Recent faces retrieved', faces);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to get recent faces', error);
    }
  };

  getFollowingfaces = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const userId = (req as AuthRequest).user._id;
    const { date } = req.query;

    try {
      const following = await Follow.find({ userId }).select('followingId');

      const followingUserIds = following.map((follow) => follow.followingId);
      console.log(followingUserIds);

      const facePipelineBuilder = facePipeline(null, userId)
        .match({ 'user._id': { $in: followingUserIds } })
        .match({ isReplyTo: null })
        .sort({ createdAt: -1 });

      if (date) {
        facePipelineBuilder.match({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const faces = await facePipelineBuilder.limit(10).exec();

      return this.successRes(res, 200, 'Following faces retrieved', faces);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to get following faces', error);
    }
  };

  getfaceReplies = async (req: Request, res: Response): Promise<Response> => {
    const { faceId } = req.params;
    const userId = (req as AuthRequest).user._id;
    const { date } = req.query;

    try {
      const facePipelineBuilder = facePipeline(null, userId)
        .match({
          isReplyTo: new Types.ObjectId(faceId),
        })
        .sort({ createdAt: -1 });

      if (date) {
        facePipelineBuilder.match({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const faceReplies = await facePipelineBuilder.limit(10).exec();

      return this.successRes(res, 200, 'face replies retrieved', faceReplies);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to get face replies', error);
    }
  };

  getUserfaces = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const authUserId = (req as AuthRequest).user._id;
    const { date } = req.query;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const facePipelineBuilder = facePipeline(null, authUserId)
        .match({
          'user._id': new Types.ObjectId(userId),
          isReplyTo: null,
        })
        .sort({ createdAt: -1 });

      if (date) {
        facePipelineBuilder.match({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const faces = await facePipelineBuilder.limit(10).exec();

      return this.successRes(res, 200, 'faces from user retrieved', faces);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting faces', error);
    }
  };

  getUserLikedfaces = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { userId } = req.params;
    const authUserId = (req as AuthRequest).user._id;
    const { date } = req.query;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const facePipelineBuilder = facePipeline(
        {
          'likes.userId': new Types.ObjectId(userId),
        },
        authUserId,
      ).sort({ createdAt: -1 });

      if (date) {
        facePipelineBuilder.match({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const faces = await facePipelineBuilder.limit(10).exec();

      return this.successRes(
        res,
        200,
        'Liked faces from user retrieved',
        faces,
      );
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting liked faces', error);
    }
  };

    getUserReplies = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const authUserId = (req as AuthRequest).user._id;
    const { date } = req.query;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const facePipelineBuilder = facePipeline(null, authUserId)
        .match({
          'user._id': new Types.ObjectId(userId),
          isReplyTo: { $ne: null },
        })
        .sort({
          createdAt: -1,
        });

      if (date) {
        facePipelineBuilder.match({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const faces = await facePipelineBuilder.limit(10).exec();

      return this.successRes(res, 200, 'Replies from user retrieved', faces);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting replies', error);
    }
  };

  searchfaces = async (req: Request, res: Response): Promise<Response> => {
    const { query, filter, page } = req.query;
    const userId = (req as AuthRequest).user._id;

    if (!query) {
      return this.errorRes(res, 400, 'Query cannot be empty');
    }

    try {
      const myBlocks = await Block.find({ userId });
      const blocksMe = await Block.find({ blockedUserId: userId });

      const blockedUserIds = myBlocks.map((block) => block.blockedUserId);
      const blockedByUserIds = blocksMe.map((block) => block.userId);

      const facePipelineBuilder = facePipeline(null, userId).match({
        $and: [
          { content: { $regex: query as string, $options: 'i' } },
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

      const faces = await facePipelineBuilder
        .skip(10 * (parseInt(page as string) - 1))
        .limit(10)
        .exec();

      return this.successRes(res, 200, 'faces retrieved', faces);
    } catch (error) {
      console.error(error);
      return this.errorRes(res, 500, 'Failed to get faces', error);
    }
  };

  handleLike = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { faceId } = req.params;
      const userId = (req as AuthRequest).user._id;

      const like = await Like.findOne({ userId, faceId });

      if (like != null) {
        await like.deleteOne();

        return this.successRes(res, 200, 'face unliked', like);
      }

      await Like.create({ userId, faceId });

      return this.successRes(res, 200, 'face liked');
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to like face', error);
    }
  };
}

export default new FacelineController();
