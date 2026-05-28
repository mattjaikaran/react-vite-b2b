import { useReducer, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { getErrorMessage } from '@/lib/api'
import { Button, Input, Alert } from '@/components/ui'

interface RegisterState {
  email: string
  username: string
  password: string
  confirmPassword: string
  error: string
  isLoading: boolean
}

type RegisterAction =
  | { type: 'SET_FIELD'; field: keyof Pick<RegisterState, 'email' | 'username' | 'password' | 'confirmPassword'>; value: string }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'SET_LOADING'; isLoading: boolean }

const initialState: RegisterState = {
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  error: '',
  isLoading: false,
}

function reducer(state: RegisterState, action: RegisterAction): RegisterState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_ERROR':
      return { ...state, error: action.error }
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
  }
}

export default function RegisterPage() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { email, username, password, confirmPassword, error, isLoading } = state

  const { register, login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    dispatch({ type: 'SET_ERROR', error: '' })

    if (password !== confirmPassword) {
      dispatch({ type: 'SET_ERROR', error: 'Passwords do not match' })
      return
    }

    if (password.length < 8) {
      dispatch({ type: 'SET_ERROR', error: 'Password must be at least 8 characters' })
      return
    }

    dispatch({ type: 'SET_LOADING', isLoading: true })

    try {
      await register({ email, username, password })
      // Auto-login after registration
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: getErrorMessage(err) })
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false })
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <Alert variant="error">{error}</Alert>
          )}

          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-label="Email address"
              label="Email address"
              value={email}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })}
              placeholder="you@example.com"
            />

            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              aria-label="Username"
              label="Username"
              value={username}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'username', value: e.target.value })}
              placeholder="johndoe"
            />

            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              aria-label="Password"
              label="Password"
              value={password}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'password', value: e.target.value })}
              placeholder="••••••••"
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              aria-label="Confirm Password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'confirmPassword', value: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={isLoading} loading={isLoading} className="w-full">
            {isLoading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  )
}
