export interface EmployeeAccount {
  id: number
  email: string
  full_name: string | null
  role: 'admin' | 'telesales'
  is_active: boolean
  created_at: string
}

export interface CreateEmployeeRequest {
  email: string
  password: string
  full_name: string
}

export interface UpdateEmployeeRequest {
  full_name?: string
  is_active?: boolean
}
