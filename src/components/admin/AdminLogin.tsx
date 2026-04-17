'use client'

import { useState, FormEvent } from 'react'
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminStore } from '@/stores/admin-store'

export function AdminLogin() {
  const { login, isLoading, error, clearError } = useAdminStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await login(email, password)
    } catch {
      // error is handled by store
    }
  }

  return (
    <div className="flex items-center justify-center min-h-full p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: '#5E212915', border: '1px solid #5E212920' }}
          >
            <Lock className="w-7 h-7" style={{ color: '#5E2129' }} />
          </div>
          <h1 className="text-xl font-semibold" style={{ color: '#2C2417' }}>
            Panel Admin
          </h1>
          <p className="text-sm mt-1" style={{ color: '#8B7D6B' }}>
            KNBMP PGA-72 Content Management
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: '#6B5E50' }}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#B0A898' }} />
              <Input
                type="email"
                placeholder="admin@knbmp.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11"
                style={{ backgroundColor: '#FAF9F6', borderColor: '#E8E0D4' }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: '#6B5E50' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#B0A898' }} />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-11"
                style={{ backgroundColor: '#FAF9F6', borderColor: '#E8E0D4' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#B0A898' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="p-3 rounded-md text-sm"
              style={{ backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full h-11 text-white"
            style={{ backgroundColor: '#5E2129' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: '#B0A898' }}>
          Akses terbatas. Hanya administrator yang diizinkan.
        </p>
      </div>
    </div>
  )
}
