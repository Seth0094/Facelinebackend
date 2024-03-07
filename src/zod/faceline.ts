import { z } from 'zod';

export const createFaceSchema = z.object({
  content: z
    .string({
      required_error: 'Content is required',
      invalid_type_error: 'Content must be a string',
    })
    .max(400, 'Content must be at most 400 characters'),
  image: z
    .string({
      invalid_type_error: 'Image must be a string',
    })
    .optional(),
});

export const updateFaceSchema = createFaceSchema
  .partial()
  .superRefine(({ content, image }, ctx) => {
    if (!content && !image) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one field must be provided',
        path: ['content', 'image'],
      });
    }
  });
