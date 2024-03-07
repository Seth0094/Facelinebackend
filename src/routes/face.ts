import { Router } from 'express';
import { FacelineController } from '../controllers';
import { validate } from '../middlewares';
import { createFaceSchema, updateFaceSchema } from '../zod';

const router = Router();

router.post('/', validate(createFaceSchema), FacelineController.createFace);

router.get('/recent', FacelineController.getRecentfaces);

router.get('/following', FacelineController.getFollowingfaces);

router.get('/search', FacelineController.searchfaces);

router.get('/user/:userId', FacelineController.getUserfaces);

router.get('/user/:userId/replies', FacelineController.getUserReplies);

router.get('/user/:userId/liked', FacelineController.getUserLikedfaces);

router.post(
  '/:faceId/reply',
  validate(createFaceSchema),
  FacelineController.createFace,
);

router.get('/:faceId/replies', FacelineController.getUserReplies);

router.post('/:faceId/like', FacelineController.handleLike);

router
  .route('/:faceId')
  .get(FacelineController.getface)
  .delete(FacelineController.deleteface);

router.put(
  '/:faceId',
  validate(updateFaceSchema),
  FacelineController.updateface,
);

export default router;
