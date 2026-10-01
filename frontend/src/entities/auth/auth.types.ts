export interface ResponseLoginType {
  accessToken: string
  token_type?: string
  user?: UserProfile
}

export interface RequestLoginType {
  email: string
  password: string
}

export interface UserProfile {
  id: number
  email: string
  full_name: string | null
  role: string
  is_active: boolean
  created_at: string
}

export interface UpdateProfileRequest {
  email: string
  full_name: string
  current_password?: string
  new_password?: string
}
