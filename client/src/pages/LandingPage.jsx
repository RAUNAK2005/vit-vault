import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } }
}

const galleryImages = [
  { url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600', title: 'Cultural Fest 2023', count: '240 Photos', date: 'Oct 12', span: '' },
  { url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600', title: 'Tech Summit Alpha', count: '156 Photos', date: 'Nov 05', span: '' },
  { url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600', title: 'Annual Sports Championship', count: '890 Photos', date: 'Dec 18', span: 'lg:col-span-2 lg:aspect-auto' },
  { url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600', title: 'Campus Life & Architecture', count: '2.1K Photos', date: 'Ongoing', span: 'lg:col-span-2 lg:aspect-auto' },
  { url: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=600', title: 'Convocation Ceremony', count: '430 Photos', date: 'July 20', span: '' },
  { url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600', title: 'Lab Day Series', count: '112 Photos', date: 'Sep 02', span: '' },
]

const stats = [
  { icon: 'photo_library', value: '10K+', label: 'Photos Indexed' },
  { icon: 'event_available', value: '500+', label: 'Events Covered' },
  { icon: 'psychology', value: 'AI-Powered', label: 'Neural Search' },
]

const features = [
  { icon: 'auto_awesome', title: 'CLIP Auto-Tagging', desc: 'AI automatically tags every upload with intelligent labels using OpenAI CLIP model.', color: 'from-violet-500/20 to-indigo-500/20' },
  { icon: 'image_search', title: 'Semantic Search', desc: 'Search "students celebrating" and find relevant images — no exact tags needed.', color: 'from-blue-500/20 to-cyan-500/20' },
  { icon: 'fingerprint', title: 'Duplicate Detection', desc: 'Perceptual hashing blocks duplicate uploads, saving storage automatically.', color: 'from-emerald-500/20 to-teal-500/20' },
  { icon: 'blur_on', title: 'Quality Guard', desc: 'OpenCV blur detection rejects low-quality images before they hit cloud storage.', color: 'from-amber-500/20 to-orange-500/20' },
  { icon: 'qr_code_scanner', title: 'QR Event Upload', desc: 'Scan a QR code at any event to instantly upload photos to that event\'s gallery.', color: 'from-pink-500/20 to-rose-500/20' },
  { icon: 'cloud_download', title: 'Bulk Download', desc: 'Download all approved photos from any event as a single ZIP file.', color: 'from-sky-500/20 to-blue-500/20' },
]

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a14] text-slate-900 dark:text-white transition-colors duration-300"
    >
      {/* Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] hero-gradient pointer-events-none" />

      <Navbar variant="landing" />

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="home" className="relative pt-20 pb-16 px-6 text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3b3bed]/10 border border-[#3b3bed]/20 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-[#3b3bed] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3b3bed]">Now Live: Annual Fest Gallery 2024</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} custom={1} className="text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-[1.1]">
              <span className="text-gradient">VIT Media Vault</span>
            </motion.h1>

            <motion.p variants={fadeInUp} custom={2} className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-3 max-w-2xl mx-auto font-light">
              The ultimate AI-powered ecosystem for university memories at
            </motion.p>
            <motion.p variants={fadeInUp} custom={2.5} className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-10 max-w-2xl mx-auto font-semibold tracking-wide">
              Vidyalankar Institute of Technology
            </motion.p>

            <motion.div variants={fadeInUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/gallery"
                className="w-full sm:w-auto bg-[#3b3bed] hover:bg-[#3b3bed]/90 text-white font-bold py-4 px-10 rounded-xl glow-button transition-transform active:scale-95"
              >
                Get Started
              </Link>
              <Link
                to="/gallery"
                className="w-full sm:w-auto glass hover:bg-slate-200 dark:hover:bg-white/10 font-bold py-4 px-10 rounded-xl transition-all text-slate-900 dark:text-white"
              >
                View Showcase
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                custom={i}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="glass p-8 rounded-2xl flex flex-col items-center gap-3 cursor-default"
              >
                <span className="material-symbols-outlined text-[#3b3bed] text-4xl">{stat.icon}</span>
                <div className="text-center">
                  <p className="text-3xl font-black">{stat.value}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium uppercase tracking-widest">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Gallery Preview */}
        <section id="events" className="py-24 px-6 lg:px-20 bg-slate-200/50 dark:bg-slate-900/20 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
            >
              <div>
                <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">Capturing the Essence</motion.h2>
                <motion.p variants={fadeInUp} custom={1} className="text-slate-600 dark:text-slate-400 max-w-lg">
                  Explore high-quality captures from across the Vidyalankar campus, sorted by our intelligent AI engine.
                </motion.p>
              </div>
              <motion.div variants={fadeInUp} custom={2} className="flex gap-2">
                <button className="glass p-3 rounded-lg hover:bg-[#3b3bed]/20 transition-colors">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">search</span>
                  <input className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-48 lg:w-64 placeholder:text-slate-500" placeholder="Search by event, face, or date..." type="text" />
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {galleryImages.map((img, i) => (
                <motion.div
                  key={img.title}
                  variants={fadeInUp}
                  custom={i}
                  className={`group relative overflow-hidden rounded-2xl ${img.span || 'aspect-[4/5]'} glass cursor-pointer`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${img.url}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-white font-bold">{img.title}</p>
                    <p className="text-white/60 text-xs">{img.count} • {img.date}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3b3bed]/10 border border-[#3b3bed]/20 mb-6">
                <span className="material-symbols-outlined text-[#3b3bed] text-sm">auto_awesome</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#3b3bed]">Powered by AI</span>
              </motion.div>
              <motion.h2 variants={fadeInUp} custom={1} className="text-3xl md:text-5xl font-bold mb-4">
                Intelligence Built In
              </motion.h2>
              <motion.p variants={fadeInUp} custom={2} className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Every photo uploaded to VIT Media Vault is processed by our AI pipeline — auto-tagged, quality-checked, and indexed for semantic search.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  custom={i}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                  className={`glass p-8 rounded-2xl cursor-default group`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-white text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Preserve Your <span className="text-gradient">Campus Memories</span>?
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-slate-600 dark:text-slate-400 mb-10 max-w-xl mx-auto">
              Join the Vidyalankar Institute of Technology media ecosystem. Upload, search, and share with the power of AI.
            </motion.p>
            <motion.div variants={fadeInUp} custom={2} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="bg-[#3b3bed] hover:bg-[#3b3bed]/90 text-white font-bold py-4 px-10 rounded-xl glow-button transition-transform active:scale-95"
              >
                Sign Up with Institute Email
              </Link>
              <Link
                to="/gallery"
                className="glass hover:bg-slate-200 dark:hover:bg-white/10 font-bold py-4 px-10 rounded-xl transition-all text-slate-900 dark:text-white"
              >
                Explore Gallery
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </motion.div>
  )
}
