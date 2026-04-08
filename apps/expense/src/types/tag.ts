export interface Tag {
  id: number
  name: string
  color: string | null
  created_at: number
}

export interface CreateTagParams {
  name: string
  color?: string | null
}

export interface UpdateTagParams {
  name?: string
  color?: string | null
}
