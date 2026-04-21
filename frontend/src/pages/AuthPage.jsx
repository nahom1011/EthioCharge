import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register as registerApi, login as loginApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Zap, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import './AuthPage.css'

export default function AuthPage() {
  const navigate = useNavigate()
  const { loginSuccess } = useAuth()
  const [mode, setMode] = useState('login')   // 'login' | 'register'
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: '', first_name: '', last_name: ''
  })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'register') {
        const { data } = await registerApi(form)
        loginSuccess(data)
        toast.success(`Welcome, ${data.user.username}!`)
        navigate('/')
      } else {
        const data = await loginApi({ username: form.username, password: form.password })
        // For login, we need to get user info
        loginSuccess({ ...data, user: { username: form.username } })
        // Load full user via /me
        toast.success('Signed in!')
        navigate('/')
      }
    } catch (err) {
      const detail = err.response?.data
      if (detail?.detail) toast.error(detail.detail)
      else if (typeof detail === 'object') {
        const first = Object.values(detail)?.[0]
        toast.error(Array.isArray(first) ? first[0] : 'Check your input')
      } else toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon"><Zap size={24} fill="currentColor" /></div>
          <span>Ethio<span>Charge</span></span>
        </div>

        <h1 className="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Sign in to add and manage stations'
            : 'Join the community — it\'s free'}
        </p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign In</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-row-2">
              <div className="form-group">
                <label>First Name</label>
                <input className="input" placeholder="Abebe" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input className="input" placeholder="Kebede" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Username *</label>
            <div className="input-icon-wrap">
              <User size={15} className="input-icon" />
              <input className="input has-icon" required placeholder="your_username"
                value={form.username} onChange={(e) => set('username', e.target.value)} />
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Email</label>
              <div className="input-icon-wrap">
                <Mail size={15} className="input-icon" />
                <input className="input has-icon" type="email" placeholder="you@example.com"
                  value={form.email} onChange={(e) => set('email', e.target.value)} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Password *</label>
            <div className="input-icon-wrap">
              <Lock size={15} className="input-icon" />
              <input className="input has-icon" required
                type={showPwd ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Min. 8 characters' : '••••••••'}
                value={form.password} onChange={(e) => set('password', e.target.value)} />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Confirm Password *</label>
              <div className="input-icon-wrap">
                <Lock size={15} className="input-icon" />
                <input className="input has-icon" required type={showPwd ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={form.password2} onChange={(e) => set('password2', e.target.value)} />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>

      {/* BG decoration */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
    </div>
  )
}
