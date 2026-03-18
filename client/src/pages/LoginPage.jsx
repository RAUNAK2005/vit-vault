import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('EMAIL') // 'EMAIL' or 'OTP'
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSendOtp = async (e) => {
    e.preventDefault()
    
    if (!email.endsWith('@vit.edu.in')) {
      setMessage({ type: 'error', text: 'Please use a valid @vit.edu.in email address' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'OTP sent! Please check your email' })
      setStep('OTP')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    } else if (data.session) {
      navigate('/gallery')
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    
    // Trigger Supabase OAuth flow
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Build the current URL correctly depending on local dev vs production
        redirectTo: `${window.location.origin}/gallery`
      }
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    }
    // If successful, the page completely redirects to Google
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-mesh selection:bg-[#3b3bed]/30 relative p-6"
    >
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#3b3bed]/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3b3bed]/10 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="glass-card rounded-xl p-8 shadow-2xl"
        >
          {/* Logo & Title */}
          <div className="flex flex-col items-center gap-6 mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
              className="p-3 bg-[#3b3bed]/10 rounded-xl border border-[#3b3bed]/20"
            >
              <span className="material-symbols-outlined text-[#3b3bed] text-4xl leading-none">token</span>
            </motion.div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">VIT Media Vault</h1>
              <p className="text-slate-400 text-sm">Secure access for the Vidyalankar Community</p>
            </div>
          </div>

          {/* Google Sign In */}
          <div className="space-y-4">
            <motion.button
              onClick={handleGoogleLogin}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-200 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-all border border-slate-200 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>{loading ? 'Redirecting...' : 'Sign in with Google'}</span>
            </motion.button>
            <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-medium">
              Use your @vit.edu.in email
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-[#111121]/80 px-4 text-slate-500 font-medium tracking-widest text-xs">OR</span>
            </div>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-3 rounded-lg text-sm border font-medium ${
                  message.type === 'error' 
                    ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Form */}
          {step === 'EMAIL' ? (
            <form className="space-y-4" onSubmit={handleSendOtp}>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1" htmlFor="email">
                  Registration Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">alternate_email</span>
                  <input
                    className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-[#3b3bed] focus:ring-1 focus:ring-[#3b3bed] rounded-lg py-3 pl-10 pr-4 text-slate-100 placeholder:text-slate-600 transition-all outline-none"
                    id="email"
                    placeholder="name@vit.edu.in"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full bg-[#3b3bed]/20 hover:bg-[#3b3bed]/30 disabled:opacity-50 text-[#3b3bed] font-bold py-3 px-4 rounded-lg transition-all border border-[#3b3bed]/30 flex items-center justify-center gap-2"
                type="submit"
              >
                {loading ? (
                  <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-xl">passkey</span>
                )}
                {loading ? 'Sending...' : 'Get OTP to Login'}
              </motion.button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1" htmlFor="otp">
                  Enter 8-Digit OTP
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">dialpad</span>
                  <input
                    className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-[#3b3bed] focus:ring-1 focus:ring-[#3b3bed] rounded-lg py-3 pl-10 pr-4 text-slate-100 placeholder:text-slate-600 transition-all outline-none tracking-[0.3em] font-mono text-center"
                    id="otp"
                    placeholder="--------"
                    type="text"
                    maxLength={8}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep('EMAIL')}
                  className="text-xs text-[#3b3bed] mt-2 ml-1 hover:underline"
                >
                  &larr; Use a different email
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || otp.length < 8}
                className="w-full bg-[#3b3bed] hover:bg-[#3b3bed]/80 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-[#3b3bed]/20 flex items-center justify-center gap-2"
                type="submit"
              >
                {loading ? (
                  <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-xl">login</span>
                )}
                {loading ? 'Verifying...' : 'Verify & Login'}
              </motion.button>
            </form>
          )}

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-slate-700/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 group cursor-pointer">
              <span className="material-symbols-outlined text-slate-500 text-lg group-hover:text-[#3b3bed] transition-colors">help</span>
              <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">Support</span>
            </div>
            <div className="flex items-center gap-2 group cursor-pointer">
              <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">Privacy Policy</span>
              <span className="material-symbols-outlined text-slate-500 text-lg group-hover:text-[#3b3bed] transition-colors">policy</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-slate-800" />
            <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Premium Media Repository</p>
            <div className="h-px w-8 bg-slate-800" />
          </div>
          <p className="text-slate-600 text-xs">Vidyalankar Institute of Technology, Mumbai</p>
          <Link to="/" className="text-[#3b3bed] text-xs hover:underline">&larr; Back to Home</Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
