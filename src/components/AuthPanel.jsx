import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AuthPanel = ({ open, onClose, onAuthSuccess, apiBase }) => {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const submit = async () => {
    setMessage('')
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
    const url = `${apiBase || ''}${endpoint}`
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage(data.message || 'Success')
        onAuthSuccess && onAuthSuccess({ name: data.name, email: data.email })
        onClose()
      } else {
        setMessage(data.message || 'Failed')
      }
    } catch (e) {
      setMessage('Network error')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-md rounded-2xl glass-effect border border-luxury-gold/30 p-6 space-y-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-lg text-luxury-gold font-semibold">{mode === 'login' ? 'Login' : 'Register'}</p>
              <button className="text-luxury-cream/60 hover:text-luxury-gold" onClick={onClose}>✕</button>
            </div>

            {mode === 'register' && (
              <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
                Name
                <input
                  className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </label>
            )}

            <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
              Email
              <input
                className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
              Password
              <input
                className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
              />
            </label>

            {message && <p className="text-xs text-luxury-gold">{message}</p>}

            <div className="flex items-center justify-between">
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-xs text-luxury-cream/60 hover:text-luxury-gold"
              >
                {mode === 'login' ? "Don't have an account? Register" : 'Have an account? Login'}
              </button>
              <button
                onClick={submit}
                className="px-4 py-2 rounded-xl bg-luxury-gold text-luxury-navy font-semibold hover:brightness-105 transition"
              >
                Submit
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AuthPanel
