import { z } from 'zod'

const MAX_FILE_SIZE = 50 * 1024 * 1024
const ALLOWED_FILE_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/aac',
  'audio/mp4',
  'audio/flac',
  'audio/x-flac',
]

const FileSchema =
  typeof window !== 'undefined'
    ? z
        .instanceof(File)
        .refine(file => file.size <= MAX_FILE_SIZE, {
          message: 'Dung lượng tệp vượt quá giới hạn 50 MB',
        })
        .refine(file => ALLOWED_FILE_TYPES.includes(file.type), {
          message: 'Định dạng không hợp lệ. Hỗ trợ MP3, WAV, M4A, OGG, AAC và FLAC',
        })
    : z.any()

export const MediaFileSchema = z.object({
  clientNumber: z.string().trim().min(1, { message: 'Vui lòng nhập số điện thoại' }),
  telesaleId: z.string().optional(),
  projectId: z.string().optional(),
  file: FileSchema,
})

export type MediaFileData = z.infer<typeof MediaFileSchema>
