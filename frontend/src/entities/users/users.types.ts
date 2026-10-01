export interface UserAccount {
  id: number
  email: string
  username?: string | null
  full_name: string | null
  role: 'admin' | 'telesales'
  is_active: boolean
  created_at: string
}

export interface CreateUserRequest {
  email: string
  password: string
  full_name?: string
  role?: 'admin' | 'telesales'
}

export interface UpdateUserRequest {
  full_name?: string
  password?: string
  role?: 'admin' | 'telesales'
  is_active?: boolean
}
