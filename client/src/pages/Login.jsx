import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (serverError) setServerError('')
  }

  function validate() {
    const errors = {}

    if (!form.email.trim()) {
      errors.email = 'Email is required.'
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      errors.password = 'Password is required.'
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const res = await axios.post('/api/auth/login', {
        email: form.email.trim(),
        password: form.password
      })

      sessionStorage.setItem('frolicam_token', res.data.token)
      sessionStorage.setItem('frolicam_user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Something went wrong. Please try again in a moment.'
      setServerError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-backdrop" aria-hidden="true" />

      <div className="auth-card">
        <div className="brand">
          <div className="brand-mark">FA</div>
          <div>
            <p className="brand-name">FrolicAM</p>
            <p className="brand-tagline">Learn. Build. Get Placed.</p>
          </div>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">
          Sign in to continue your internship and project-building journey.
        </p>

        {serverError && (
          <div className="alert alert-error" role="alert">
            {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className={fieldErrors.email ? 'input-error' : ''}
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className={fieldErrors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          <div className="form-row">
            <label className="checkbox">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="link">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="hint">
          Demo credentials: <code>ajay@frolicam.com</code> /{' '}
          <code>frolic123</code>
        </p>
      </div>
    </div>
  )
}