'use client'

import { useActionState } from 'react'
import { adminLogin } from '@/app/actions/adminAuth'

const initialState = { error: undefined }

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(adminLogin, initialState)

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-sm text-gray-500 mt-1">C-Suite Magazine</p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#082945] focus:border-transparent"
              placeholder="Enter admin password"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 px-4 bg-[#082945] text-white rounded-md hover:bg-[#0a3a5c] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Checking…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
