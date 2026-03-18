import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

const photos = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500',
]

const fileNames = [
  'IMG_0832.jpg', 'SPEAKER_L_01.jpg', 'CROWD_REACTION.jpg', 'STAGE_MACRO.jpg',
  'ATMOSPHERE_01.jpg', 'DISPLAY_BOARD.jpg', 'RECEPTION_WIDE.jpg', 'AFTERPARTY.jpg',
]

export default function EventDetailPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden"
    >
      <Navbar variant="internal" />

      <main className="flex-grow container mx-auto px-6 lg:px-20 py-8">
        {/* Hero Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-12 group"
        >
          <div className="aspect-[21/9] w-full bg-slate-800 relative">
            <img
              className="w-full h-full object-cover opacity-60"
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200"
              alt="Annual Tech Gala 2024"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#3b3bed] font-semibold text-sm uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">verified</span>
                Verified Event
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Annual Tech Gala 2024</h1>
              <p className="text-slate-400 flex items-center gap-2 flex-wrap">
                <span className="material-symbols-outlined text-base">calendar_today</span>
                October 24, 2024
                <span className="mx-2 opacity-30">|</span>
                <span className="material-symbols-outlined text-base">location_on</span>
                Vidyalankar Institute of Technology, Mumbai
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#3b3bed] hover:bg-[#3b3bed]/90 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined">download</span>
                Bulk Download
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all border border-white/10"
              >
                <span className="material-symbols-outlined">cloud_upload</span>
                Export to Drive
              </motion.button>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* QR Upload */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3b3bed]">qr_code_2</span>
                Instant Upload
              </h3>
              <div className="bg-white p-4 rounded-xl aspect-square flex items-center justify-center">
                <div className="w-full h-full border-4 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2">qr_code_scanner</span>
                  <span className="text-[10px] font-bold uppercase tracking-tight text-center">Scan to upload photos from mobile</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed text-center">
                Direct guest upload is enabled. Photos are automatically screened by VIT AI.
              </p>
            </div>

            {/* Stats */}
            <div className="glass p-6 rounded-2xl border border-white/5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Event Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Approved Photos</span>
                  <span className="font-bold">1,284</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Storage Used</span>
                  <span className="font-bold">4.2 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Contributors</span>
                  <span className="font-bold">42</span>
                </div>
              </div>
            </div>

            {/* Vault Link */}
            <div className="glass p-6 rounded-2xl border border-white/5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Vault Link</h3>
              <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-xs truncate flex-grow px-2 font-mono text-[#3b3bed]">vit.vault/gala-2024</span>
                <button className="p-2 bg-[#3b3bed] rounded-md text-white hover:bg-[#3b3bed]/80 transition-colors">
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                </button>
              </div>
            </div>
          </motion.aside>

          {/* Photo Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Approved Photos</h2>
                <span className="px-3 py-1 bg-[#3b3bed]/20 text-[#3b3bed] text-xs font-bold rounded-full border border-[#3b3bed]/30">LATEST FIRST</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 glass rounded-lg border border-white/10 hover:bg-white/5">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <button className="p-2 glass rounded-lg border border-white/10 hover:bg-white/5">
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
              </div>
            </div>

            {/* Masonry */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              className="masonry-columns"
            >
              {photos.map((url, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  custom={i}
                  className="masonry-columns-item group relative rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    className="w-full transition-transform duration-500 group-hover:scale-110"
                    src={url}
                    alt={fileNames[i]}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-white">{fileNames[i]}</span>
                      <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-[#3b3bed] transition-colors">
                        <span className="material-symbols-outlined text-sm">download</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Load More */}
            <div className="mt-12 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass border border-white/10 px-10 py-4 rounded-xl font-bold hover:bg-white/5 transition-all text-slate-300"
              >
                Load More Photos
              </motion.button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 lg:px-20 py-12 bg-black/20 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-50">
            <div className="size-8 bg-slate-700 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">shield_moon</span>
            </div>
            <span className="text-sm font-bold">VIT Media Vault</span>
          </div>
          <p className="text-sm text-slate-500">© 2025 Vidyalankar Institute of Technology. All assets are private and encrypted.</p>
          <div className="flex gap-6 text-slate-500">
            <a className="text-sm hover:text-[#3b3bed] transition-colors" href="#">Privacy</a>
            <a className="text-sm hover:text-[#3b3bed] transition-colors" href="#">Terms</a>
            <a className="text-sm hover:text-[#3b3bed] transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}
