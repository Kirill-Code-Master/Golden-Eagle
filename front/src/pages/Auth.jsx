import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login, register, isLoggedIn } from '../lib/auth'
import './Auth.css'

export default function Auth({ mode: initialMode }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [mode, setMode] = useState(initialMode || 'login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/')
    }
  }, [navigate])

  // Sync mode with props if routing changes
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode)
    }
    // Clear inputs and errors when switching modes
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setErrors({})
    setServerError('')
    setSuccessMessage('')
  }, [initialMode, mode])

  const validate = () => {
    const newErrors = {}
    if (!username.trim()) {
      newErrors.username = 'Логін обов`язковий'
    } else if (username.trim().length < 3) {
      newErrors.username = 'Логін має містити від 3 символів'
    }

    if (!password) {
      newErrors.password = 'Пароль обов’язковий'
    }

    if (mode === 'register') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Підтвердьте пароль'
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Паролі не співпадають'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setSuccessMessage('')
    
    if (!validate()) return

    setLoading(true)
    try {
      if (mode === 'login') {
        await login(username, password)
        // Redirect to previous page or home
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      } else {
        await register(username, password)
        setSuccessMessage('Реєстрація успішна! Тепер ви можете увійти.')
        // Switch to login tab after 2 seconds
        setTimeout(() => {
          setMode('login')
          setSuccessMessage('')
          setPassword('')
          setConfirmPassword('')
        }, 2000)
      }
    } catch (err) {
      setServerError(err.message || 'Сталася помилка при з’єднанні з сервером.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ge-container ge-auth-container">
      <div className="ge-auth-card">
        <div className="ge-auth-tabs">
          <button 
            type="button"
            className={`ge-auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login')
              navigate('/login')
            }}
          >
            Увійти
          </button>
          <button 
            type="button"
            className={`ge-auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register')
              navigate('/register')
            }}
          >
            Реєстрація
          </button>
        </div>

        {serverError && (
          <div className="ge-auth-error ge-auth-alert" role="alert">
            ⚠️ {serverError}
          </div>
        )}

        {successMessage && (
          <div className="ge-auth-success ge-auth-alert" role="status">
            ✨ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ge-auth-form" noValidate>
          <div className="ge-form-group">
            <label htmlFor="username">Логін користувача</label>
            <input
              id="username"
              type="text"
              className={`ge-input ${errors.username ? 'error' : ''}`}
              placeholder="Введіть ваш логін"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
            {errors.username && <span className="ge-error-text">{errors.username}</span>}
          </div>

          <div className="ge-form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              className={`ge-input ${errors.password ? 'error' : ''}`}
              placeholder="Введіть пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {errors.password && <span className="ge-error-text">{errors.password}</span>}
          </div>

          {mode === 'register' && (
            <div className="ge-form-group">
              <label htmlFor="confirmPassword">Підтвердження паролю</label>
              <input
                id="confirmPassword"
                type="password"
                className={`ge-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Повторіть пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="ge-error-text">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button 
            type="submit" 
            className="ge-btn-view ge-btn-view--primary ge-auth-submit"
            disabled={loading}
          >
            {loading ? 'Завантаження...' : mode === 'login' ? 'Увійти' : 'Зареєструватися'}
          </button>
        </form>
      </div>
    </div>
  )
}
