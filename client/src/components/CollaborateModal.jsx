import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function CollaborateModal({ isOpen, onClose, folderId, folderName }) {
  const [email, setEmail] = useState('')
  const [collaborators, setCollaborators] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (isOpen && folderId) {
      setEmail('')
      setErrorMsg('')
      setSuccessMsg('')
      fetchCollaborators()
    }
  }, [isOpen, folderId])

  const fetchCollaborators = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data, error } = await supabase
        .from('events')
        .select('collaborators')
        .eq('id', folderId)
        .single()
        
      if (error) {
        if (error.message.includes('collaborators')) {
           setErrorMsg("Backend pending: Registration of collaboration features is not yet deployed by the DB team.")
        } else {
           throw error
        }
      } else if (data) {
        setCollaborators(data.collaborators || [])
      }
    } catch (err) {
      console.error("Error fetching collaborators:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg("Please enter a valid email address.")
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // 1. Fetch current array again to avoid race conditions
      const { data, error: fetchErr } = await supabase
        .from('events')
        .select('collaborators')
        .eq('id', folderId)
        .single()

      if (fetchErr) {
        if (fetchErr.message.includes('collaborators')) {
          setErrorMsg("Backend pending: The database schema needs to be updated by the DB team before you can add collaborators.")
          setLoading(false)
          return
        }
        throw fetchErr
      }

      let currentCollaborators = data.collaborators || []
      
      const newEmail = email.trim().toLowerCase()
      if (currentCollaborators.includes(newEmail)) {
        setErrorMsg("This user is already a collaborator.")
        setLoading(false)
        return
      }

      currentCollaborators.push(newEmail)

      // 2. Update array
      const { error: updateErr } = await supabase
        .from('events')
        .update({ collaborators: currentCollaborators })
        .eq('id', folderId)

      if (updateErr) throw updateErr

      setSuccessMsg(`${newEmail} has been added as a collaborator!`)
      setCollaborators(currentCollaborators)
      setEmail('')
      
      // Dispatch an event so gallery refreshes to update permissions if needed
      window.dispatchEvent(new Event('collaboratorsUpdated'))
      
    } catch (err) {
      console.error("Error adding collaborator:", err)
      setErrorMsg("Failed to add collaborator. Check console.")
    } finally {
      setLoading(false)
    }
  }

  const executeRemove = async (emailToRemove) => {
    setLoading(true)
    setErrorMsg('')
    try {
      const updatedCollaborators = collaborators.filter(e => e !== emailToRemove)
      
      const { error } = await supabase
        .from('events')
        .update({ collaborators: updatedCollaborators })
        .eq('id', folderId)

      if (error) throw error

      setCollaborators(updatedCollaborators)
      setSuccessMsg(`${emailToRemove} removed.`)
      window.dispatchEvent(new Event('collaboratorsUpdated'))
    } catch (err) {
      console.error("Error removing:", err)
      setErrorMsg("Failed to remove collaborator.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (emailToRemove) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm">Remove <strong>{emailToRemove}</strong> from collaborators?</p>
        <div className="flex gap-2">
          <button 
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold w-full transition-colors"
            onClick={() => {
              toast.dismiss(t.id);
              executeRemove(emailToRemove);
            }}>Remove</button>
          <button 
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold w-full transition-colors"
            onClick={() => toast.dismiss(t.id)}>Cancel</button>
        </div>
      </div>
    ), { duration: Infinity, id: 'remove-collab' });
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0a0a14] border border-[#3b3bed]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <span className="material-symbols-outlined text-sm font-bold">group_add</span>
              </div>
              <h2 className="text-lg font-bold text-white">Collaborate</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
              <span className="material-symbols-outlined text-sm font-bold">close</span>
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <p className="text-sm text-slate-400">
                Invite team members to upload media to <strong className="text-white">{folderName}</strong>.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg leading-relaxed">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg leading-relaxed">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleInvite} className="flex gap-2 relative">
              <input
                type="email"
                placeholder="Enter email address (e.g., jane@gmail.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-[#3b3bed]/50 outline-none transition-all placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="px-4 py-2 bg-[#3b3bed] hover:bg-[#3b3bed]/80 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#3b3bed]/20 flex items-center gap-1"
              >
                {loading ? <span className="material-symbols-outlined animate-spin text-sm">refresh</span> : 'Invite'}
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Current Collaborators</h3>
              
              {collaborators.length === 0 ? (
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center text-slate-400 text-sm">
                  No collaborators yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                  {collaborators.map((cEmail, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#3b3bed] text-white flex items-center justify-center font-bold text-xs uppercase shadow-md shadow-[#3b3bed]/20">
                          {cEmail.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-200">{cEmail}</span>
                      </div>
                      <button 
                        onClick={() => handleRemove(cEmail)}
                        className="p-1.5 hover:bg-red-500/10 hover:text-red-400 text-slate-500 rounded-lg transition-colors"
                        title="Remove collaborator"
                      >
                        <span className="material-symbols-outlined text-sm">person_remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
