'use client'

import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import { api } from '@/lib/api'

export type AuthUser = {
  id: string
  username: string
  name: string
  regionId: string | null
  storeId: string | null
  permissions: string[]
  roles: { code: string; name: string; dataScope: string }[]
}
type AuthState = { user: AuthUser | null; loading: boolean }
export const loadMe = createAsyncThunk(
  'auth/me',
  async () => (await api.get('/auth/me')).data.data as AuthUser,
)
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false } as AuthState,
  reducers: {
    clearAuth(state) {
      state.user = null
      state.loading = false
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(loadMe.pending, (state) => {
        state.loading = true
      })
      .addCase(loadMe.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(loadMe.rejected, (state) => {
        state.loading = false
        state.user = null
      }),
})
export const { clearAuth } = authSlice.actions
export const makeStore = (user: AuthUser | null = null) =>
  configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState: { auth: { user, loading: false } },
  })
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
