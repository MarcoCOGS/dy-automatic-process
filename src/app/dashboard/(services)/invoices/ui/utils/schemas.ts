import { z } from 'zod';

const fileSizeLimit = 1024 * 1024 * 10; // 10MB

export const FileSchema = z
  .instanceof(File)
  .refine((file) => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type), {
    message: 'Invalid file type',
  })
  .refine((file) => file.size <= fileSizeLimit, {
    message: 'File size should not exceed 10MB',
  });
