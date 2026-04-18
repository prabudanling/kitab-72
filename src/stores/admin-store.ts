'use client'

import { create } from 'zustand'

const API_BASE = '/api/admin'

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  avatar?: string | null
}

interface AdminState {
  user: AdminUser | null
  isAuthenticated: boolean
  isPanelOpen: boolean
  activeView: string
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  togglePanel: () => void
  openPanel: () => void
  closePanel: () => void
  setActiveView: (view: string) => void
  clearError: () => void
}

export const useAdminStore = create<AdminState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isPanelOpen: false,
  activeView: 'dashboard',
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login gagal')
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Login gagal' })
      throw err
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE}/auth`, {
        method: 'DELETE',
        credentials: 'include',
      })
    } catch {
      // silent
    }
    set({ user: null, isAuthenticated: false, activeView: 'dashboard', isPanelOpen: false })
  },

  checkSession: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok && data.user) {
        set({ user: data.user, isAuthenticated: true })
      } else {
        set({ user: null, isAuthenticated: false })
      }
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },

  togglePanel: () => {
    const { isPanelOpen, isAuthenticated } = get()
    if (!isAuthenticated) {
      set({ isPanelOpen: !isPanelOpen, activeView: 'login' })
    } else {
      set({ isPanelOpen: !isPanelOpen })
    }
  },

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  setActiveView: (view: string) => set({ activeView: view }),
  clearError: () => set({ error: null }),
}))

// Shared API helper
export async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.error || `API Error: ${res.status}`)
  }
  return res.json()
}
