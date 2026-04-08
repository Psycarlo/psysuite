export interface Attachment {
  id: number
  entry_id: number
  file_path: string
  file_name: string
  mime_type: string | null
  file_size: number | null
  created_at: number
}

export interface CreateAttachmentParams {
  entry_id: number
  file_path: string
  file_name: string
  mime_type?: string | null
  file_size?: number | null
}
