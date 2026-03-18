import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6 lg:px-20 glass">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#3b3bed] p-2 rounded-lg">
              <span className="material-symbols-outlined text-white text-sm">auto_awesome_motion</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">VIT Media Vault</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Vidyalankar Institute of Technology</p>
            </div>
          </div>
          <p className="text-slate-400 max-w-sm mb-6">
            Revolutionizing university media storage with cutting-edge artificial intelligence at Vidyalankar Institute of Technology.
            Your memories, preserved forever in the highest quality.
          </p>
          <div className="flex gap-4">
            <a className="text-slate-400 hover:text-[#3b3bed] transition-colors" href="#">
              <span className="material-symbols-outlined">public</span>
            </a>
            <a className="text-slate-400 hover:text-[#3b3bed] transition-colors" href="#">
              <span className="material-symbols-outlined">camera</span>
            </a>
            <a className="text-slate-400 hover:text-[#3b3bed] transition-colors" href="#">
              <span className="material-symbols-outlined">alternate_email</span>
            </a>
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-6">Explore</h3>
          <ul className="space-y-4 text-slate-400 text-sm">
            <li><Link className="hover:text-[#3b3bed] transition-colors" to="/gallery">Latest Events</Link></li>
            <li><Link className="hover:text-[#3b3bed] transition-colors" to="/gallery">Trending Photos</Link></li>
            <li><a className="hover:text-[#3b3bed] transition-colors" href="#">Contributors</a></li>
            <li><a className="hover:text-[#3b3bed] transition-colors" href="#features">AI Features</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-6">Support</h3>
          <ul className="space-y-4 text-slate-400 text-sm">
            <li><a className="hover:text-[#3b3bed] transition-colors" href="#">Guidelines</a></li>
            <li><a className="hover:text-[#3b3bed] transition-colors" href="#">Privacy Policy</a></li>
            <li><a className="hover:text-[#3b3bed] transition-colors" href="#">Terms of Use</a></li>
            <li><a className="hover:text-[#3b3bed] transition-colors" href="#">Contact Admin</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium tracking-wider">
        <p>© 2025 VIT Media Vault — Vidyalankar Institute of Technology. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-8">
          <span>Vidyalankar Institute of Technology, Mumbai</span>
          <span>Powered by MediaAI</span>
        </div>
      </div>
    </footer>
  )
}
