import axios from 'axios'

export type ApiResponse<T> = { code: number; message: string; data: T; requestId: string }
export type PageResult<T> = { items: T[]; page: number; pageSize: number; total: number }

export const api = axios.create({ baseURL: '/api/v1', timeout: 15000, withCredentials: true })
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      error.response?.status === 401 &&
      !window.location.pathname.endsWith('/login')
    ) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export const errorMessage = (error: unknown) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || error.message
    : '操作失败，请稍后重试'
