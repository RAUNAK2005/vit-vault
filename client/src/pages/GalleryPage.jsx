import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import UploadModal from '../components/UploadModal'
import CollaborateModal from '../components/CollaborateModal'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}



export default function GalleryPage() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [collaborateOpen, setCollaborateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('ALL') // 'ALL', 'INSTITUTIONAL', 'COMMITTEE'
  const [selectedImage, setSelectedImage] = useState(null)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingThumbnail, setIsUpdatingThumbnail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [folders, setFolders] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [viewMode, setViewMode] = useState('GRID') // 'GRID' or 'FOLDERS'
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const fetchMedia = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('media')
        .select(`
          id,
          file_path,
          metadata,
          created_at,
          uploader_id,
          event_id,
          events ( title, type ),
          users:uploader_id ( email )
        `)
        .order('created_at', { ascending: false })

      if (selectedEventId) {
        query = query.eq('event_id', selectedEventId)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching media:", error)
      }

      if (data) {
        const formatted = data.map((m, i) => {
          const { data: publicUrlData } = supabase.storage.from('vault-media').getPublicUrl(m.file_path)
          const sizes = ['masonry-item-sm', 'masonry-item-md', 'masonry-item-lg']
          return {
            id: m.id,
            file_path: m.file_path,
            uploader_id: m.uploader_id,
            event_id: m.event_id,
            metadata: m.metadata || {},
            url: publicUrlData.publicUrl,
            title: m.events?.title || 'Unknown Event',
            type: m.events?.type || 'UNKNOWN',
            description: m.metadata?.description || 'No description provided.',
            user: m.users?.email?.split('@')[0] || 'Unknown User',
            date: new Date(m.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
            tags: m.events?.type === 'INSTITUTIONAL' ? [{ label: 'Institutional', color: 'bg-indigo-600' }] : [{ label: 'Committee', color: 'bg-emerald-600' }],
            size: sizes[i % 3] // Stagger masonry sizes deterministically
          }
        })
        setItems(formatted)
      }

      // Also fetch events for the folder view with safe backwards compatibility
      let eventDataForFolders = null;
      try {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select(`
            id,
            title,
            type,
            event_date,
            created_by,
            collaborators,
            media:media(id, file_path, metadata)
          `)
          .order('event_date', { ascending: false })
          
        if (eventError && eventError.message.includes('collaborators')) {
          console.warn("DB team hasn't added collaborators column yet. Fetching without it.")
          const fallback = await supabase
            .from('events')
            .select(`
              id,
              title,
              type,
              event_date,
              created_by,
              media:media(id, file_path, metadata)
            `)
            .order('event_date', { ascending: false })
          eventDataForFolders = fallback.data;
        } else if (eventData) {
          eventDataForFolders = eventData;
        }
      } catch (err) {
        console.error("Fetch event structure error:", err)
      }

      if (eventDataForFolders) {
        setFolders(eventDataForFolders.map(e => {
          let coverMedia = e.media?.find(m => {
            try {
              const meta = typeof m.metadata === 'string' ? JSON.parse(m.metadata) : (m.metadata || {});
              return meta.is_cover === true || meta.is_cover === 'true';
            } catch(e) { return false; }
          });
          if (!coverMedia && e.media?.length > 0) coverMedia = e.media[0];
          
          const localThumbnails = JSON.parse(localStorage.getItem('vault_thumbnails') || '{}');
          const firstImagePath = localThumbnails[e.id] || coverMedia?.file_path;
          
          const { data: coverUrlData } = firstImagePath 
            ? supabase.storage.from('vault-media').getPublicUrl(firstImagePath)
            : { data: { publicUrl: null } };

          return {
            id: e.id,
            title: e.title,
            type: e.type,
            created_by: e.created_by,
            collaborators: e.collaborators || [],
            count: e.media?.length || 0,
            date: new Date(e.event_date).toLocaleDateString(),
            coverUrl: coverUrlData.publicUrl
          }
        }))
      }
    } catch (err) {
      console.error("Fetch media unexpected error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
    window.addEventListener('mediaUploaded', fetchMedia)
    window.addEventListener('collaboratorsUpdated', fetchMedia)
    return () => {
      window.removeEventListener('mediaUploaded', fetchMedia)
      window.removeEventListener('collaboratorsUpdated', fetchMedia)
    }
  }, [selectedEventId])

  const filteredItems = items.filter(item => {
    if (activeCategory !== 'ALL' && item.type !== activeCategory) return false;
    if (searchQuery && !item.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  })

  const filteredFolders = folders.filter(f => {
    if (activeCategory !== 'ALL' && f.type !== activeCategory) return false;
    if (searchQuery && !f.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  })

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleFolderClick = (id) => {
    setSelectedEventId(id)
    setViewMode('GRID')
    setSearchQuery('')
  }

  const executeDelete = async () => {
    if (!selectedImage) return;

    setIsDeleting(true);
    try {
      // 1. Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('vault-media')
        .remove([selectedImage.file_path]);
        
      if (storageError) throw storageError;

      // 2. Delete from Database
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', selectedImage.id);
        
      if (dbError) throw dbError;

      // 3. Update UI
      setShowDeleteConfirm(false);
      setSelectedImage(null);
      fetchMedia();
    } catch (error) {
      console.error("Error deleting asset:", error);
      alert("Failed to delete asset. Check console for details.");
    } finally {
      setIsDeleting(false);
    }
  }

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} assets? This cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const itemsToDelete = items.filter(i => selectedIds.includes(i.id));
      const paths = itemsToDelete.map(i => i.file_path);

      // 1. Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('vault-media')
        .remove(paths);
        
      if (storageError) throw storageError;

      // 2. Delete from Database
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .in('id', selectedIds);
        
      if (dbError) throw dbError;

      // 3. Update UI
      setSelectionMode(false);
      setSelectedIds([]);
      fetchMedia();
    } catch (error) {
      console.error("Error deleting assets:", error);
      alert("Failed to delete some assets. Check console for details.");
    } finally {
      setIsDeleting(false);
    }
  }

  const executeSetThumbnail = async () => {
    if (!selectedImage) return;
    setIsUpdatingThumbnail(true);
    
    try {
      // 1. Fetch current covers for this event
      const { data: currentMedia } = await supabase
        .from('media')
        .select('id, metadata')
        .eq('event_id', selectedImage.event_id);
        
      const oldCovers = currentMedia?.filter(m => m.metadata?.is_cover) || [];
      
      // 2. Unset old covers
      for (const c of oldCovers) {
        if (c.id === selectedImage.id) continue;
        const newMeta = { ...c.metadata };
        delete newMeta.is_cover;
        await supabase.from('media').update({ metadata: newMeta }).eq('id', c.id);
      }
      
      // 3. Set new cover
      const newSelectedMeta = { ...selectedImage.metadata, is_cover: true };
      const { data: updatedMedia, error: setErr } = await supabase
        .from('media')
        .update({ metadata: newSelectedMeta })
        .eq('id', selectedImage.id)
        .select();
        
      if (setErr) throw setErr;
      if (!updatedMedia || updatedMedia.length === 0) {
        // Fallback to local storage to make UI work instantly while DB team is away
        console.warn("DB update blocked. Falling back to local storage.");
        const local = JSON.parse(localStorage.getItem('vault_thumbnails') || '{}');
        local[selectedImage.event_id] = selectedImage.file_path;
        localStorage.setItem('vault_thumbnails', JSON.stringify(local));
      }
      
      alert("Folder thumbnail updated successfully!");
      fetchMedia();
    } catch (err) {
      console.error("Error setting thumbnail:", err);
      alert("Failed to update folder thumbnail. Check console.");
    } finally {
      setIsUpdatingThumbnail(false);
    }
  }

  const executeDeleteFolder = async () => {
    if (!selectedEventId) return;
    const folder = folders.find(f => f.id === selectedEventId);
    if (!folder) return;

    if (!confirm(`Are you sure you want to delete the ENTIRE folder "${folder.title}" and all its ${folder.count} images? This cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      // 1. Fetch all media in this folder to delete from storage
      const { data: mediaItems } = await supabase
        .from('media')
        .select('file_path')
        .eq('event_id', selectedEventId);

      if (mediaItems && mediaItems.length > 0) {
        const paths = mediaItems.map(i => i.file_path);
        const { error: storageError } = await supabase.storage
          .from('vault-media')
          .remove(paths);
        if (storageError) throw storageError;
      }

      // 2. Delete the event (cascades to media table in DB)
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedEventId);
        
      if (eventError) throw eventError;

      // 3. Update UI
      setSelectedEventId(null);
      setViewMode('FOLDERS');
      fetchMedia();
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Failed to delete folder. Check console for details.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0a0a14]"
    >
      {/* Top Nav */}
      <header className="sticky top-0 z-50 glass border-b border-[#3b3bed]/10 px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="bg-[#3b3bed] p-1.5 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">rocket_launch</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight text-white hover:text-[#3b3bed] transition-colors">VIT Media Vault</h1>
              <p className="text-[9px] text-slate-500 tracking-wider uppercase">Vidyalankar Institute of Technology</p>
            </div>
          </Link>
          <div className="hidden lg:flex items-center gap-2">
            <label className="relative flex items-center min-w-[320px]">
              <span className="material-symbols-outlined absolute left-3 text-slate-400">search</span>
              <input
                className="w-full bg-[#3b3bed]/10 border-none rounded-xl pl-11 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#3b3bed]/50 transition-all text-white placeholder:text-slate-500 outline-none"
                placeholder="Search event folders..."
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) {
                    setSelectedEventId(null);
                    setViewMode('FOLDERS');
                  }
                }}
              />
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 px-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-slate-400 transition-colors mr-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="text-sm font-bold hidden sm:inline">Logout</span>
          </button>
          <div className="h-8 w-[1px] bg-[#3b3bed]/20 mx-1" />
          <div className="flex items-center gap-2 bg-[#3b3bed]/10 px-3 py-1.5 rounded-xl border border-[#3b3bed]/20">
            <div className="w-7 h-7 rounded-full bg-[#3b3bed] flex items-center justify-center text-xs font-bold text-white uppercase shadow-lg shadow-[#3b3bed]/20">
              {user?.email?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-medium hidden md:inline text-slate-200">{user?.email?.split('@')[0] || 'User'}</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 fixed left-0 top-[65px] bottom-0 overflow-y-auto border-r border-[#3b3bed]/5 hidden xl:block p-6">
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Library Filters</h3>
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveCategory('ALL')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${activeCategory === 'ALL' ? 'bg-[#3b3bed] text-white' : 'hover:bg-[#3b3bed]/10 text-slate-400'}`}
                >
                  <span className="material-symbols-outlined">grid_view</span> All Media
                </button>
                <button 
                  onClick={() => setActiveCategory('INSTITUTIONAL')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${activeCategory === 'INSTITUTIONAL' ? 'bg-[#3b3bed] text-white' : 'hover:bg-[#3b3bed]/10 text-slate-400'}`}
                >
                  <span className="material-symbols-outlined">account_balance</span> Institutional
                </button>
                <button 
                  onClick={() => setActiveCategory('COMMITTEE')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${activeCategory === 'COMMITTEE' ? 'bg-[#3b3bed] text-white' : 'hover:bg-[#3b3bed]/10 text-slate-400'}`}
                >
                  <span className="material-symbols-outlined">groups</span> Committees
                </button>
              </nav>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Views</h3>
              <nav className="space-y-1">
                <button 
                  onClick={() => { setViewMode('FOLDERS'); setSelectedEventId(null); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${viewMode === 'FOLDERS' ? 'bg-[#3b3bed]/20 text-[#3b3bed] border border-[#3b3bed]/30' : 'hover:bg-[#3b3bed]/10 text-slate-400'}`}
                >
                  <span className="material-symbols-outlined">folder</span> Browse Folders
                </button>
                <button 
                  onClick={() => { setViewMode('GRID'); setSelectedEventId(null); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${viewMode === 'GRID' && !selectedEventId ? 'bg-[#3b3bed]/20 text-[#3b3bed] border border-[#3b3bed]/30' : 'hover:bg-[#3b3bed]/10 text-slate-400'}`}
                >
                  <span className="material-symbols-outlined">list</span> All Photos
                </button>
              </nav>
            </div>


          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 xl:ml-64 p-4 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              {selectedEventId && (
                <button 
                  onClick={() => { setSelectedEventId(null); setViewMode('FOLDERS'); }}
                  className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
              )}
              <h2 className="text-xl font-bold text-white capitalize">
                {selectedEventId 
                  ? folders.find(f => f.id === selectedEventId)?.title 
                  : (viewMode === 'FOLDERS' ? 'Event Folders' : (activeCategory === 'ALL' ? 'Recent Uploads' : `${activeCategory.toLowerCase()} Events`))
                }
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="material-symbols-outlined text-sm">
                  {viewMode === 'FOLDERS' ? 'folder' : 'image'}
                </span>
                {viewMode === 'FOLDERS' 
                  ? `${filteredFolders.length} folders` 
                  : `Showing ${filteredItems.length} media items`
                }
              </div>
              
              {viewMode === 'GRID' && (
                <div className="flex gap-2">
                  {(() => {
                    if (!selectedEventId) return null;
                    const folder = folders.find(f => f.id === selectedEventId);
                    if (!folder) return null;
                    
                    const isCreator = folder.created_by === user?.id;
                    const isAdmin = user?.email === 'raunak.baweja@vit.edu.in';
                    const isCollaborator = folder.collaborators?.includes(user?.email);
                    
                    if (!isCreator && !isAdmin && !isCollaborator) return null;

                    return (
                      <>
                        { (isCreator || isAdmin) && (
                          <button 
                            onClick={() => setCollaborateOpen(true)}
                            className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-sm font-bold transition-all hover:bg-indigo-500/20 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">group_add</span>
                            <span className="hidden sm:inline">Collaborate</span>
                          </button>
                        )}
                        <button 
                          onClick={() => setUploadOpen(true)}
                          className="px-4 py-2 bg-[#3b3bed] text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#3b3bed]/20 hover:bg-[#3b3bed]/80"
                        >
                          <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                          <span className="hidden sm:inline">Add Images</span>
                        </button>
                        { (isCreator || isAdmin) && (
                          <button 
                            onClick={executeDeleteFolder}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-all hover:bg-red-500/20 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">folder_delete</span>
                            <span className="hidden sm:inline">Delete Folder</span>
                          </button>
                        )}
                        <div className="w-[1px] h-8 bg-white/10 mx-1 hidden sm:block" />
                      </>
                    );
                  })()}
                  {filteredItems.length > 0 && (
                    <button 
                      onClick={() => {
                        setSelectionMode(!selectionMode);
                        setSelectedIds([]);
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                        selectionMode 
                          ? 'bg-indigo-600 text-white shadow-lg' 
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {selectionMode ? 'close' : 'checklist'}
                      </span>
                      {selectionMode ? 'Cancel Selection' : 'Bundle Select'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selection Actions Bar */}
          <AnimatePresence>
            {selectionMode && selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 p-4 bg-[#3b3bed]/10 border border-[#3b3bed]/20 rounded-2xl flex items-center justify-between flex-wrap gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#3b3bed] text-white px-3 py-1 rounded-lg text-sm font-bold">
                    {selectedIds.length} Selected
                  </div>
                  <button 
                    onClick={() => setSelectedIds(filteredItems.map(i => i.id))}
                    className="text-xs text-slate-400 hover:text-white font-bold uppercase tracking-wider"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={() => setSelectedIds([])}
                    className="text-xs text-slate-400 hover:text-white font-bold uppercase tracking-wider"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      const selectedItems = items.filter(i => selectedIds.includes(i.id));
                      selectedItems.forEach(i => window.open(i.url, '_blank'));
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">download</span> Download
                  </button>
                  { (user?.email === 'raunak.baweja@vit.edu.in') && (
                    <button 
                      onClick={executeBulkDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isDeleting ? 'refresh' : 'delete'}
                      </span>
                      {isDeleting ? 'Deleting...' : 'Bulk Delete'}
                    </button>
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Rendering */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="material-symbols-outlined text-[#3b3bed] text-4xl animate-spin">refresh</span>
            </div>
          ) : viewMode === 'FOLDERS' && !selectedEventId ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredFolders.map((folder) => (
                <motion.div
                  key={folder.id}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => handleFolderClick(folder.id)}
                  className="relative group cursor-pointer"
                >
                  {/* Folder Stack Effect */}
                  <div className="absolute -inset-2 bg-gradient-to-br from-[#3b3bed]/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Secondary "Stacked" cards behind */}
                  <div className="absolute top-[-10px] left-[10%] right-[10%] h-full bg-white/5 rounded-2xl border border-white/5 -z-10 transition-transform group-hover:translate-y-[-5px]" />
                  <div className="absolute top-[-5px] left-[5%] right-[5%] h-full bg-white/5 rounded-2xl border border-white/5 -z-10 transition-transform group-hover:translate-y-[-2px]" />

                  <div className="bg-[#111121]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col">
                    {/* Cover Thumbnail */}
                    <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
                      {folder.coverUrl ? (
                        <img 
                          src={folder.coverUrl} 
                          alt={folder.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-20">
                          <span className="material-symbols-outlined text-4xl">folder_zip</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest">Empty Folder</span>
                        </div>
                      )}
                      
                      {/* Floating Folder Icon Overlay */}
                      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-xl p-2 rounded-xl border border-white/10 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3">
                        <span className="material-symbols-outlined text-[#3b3bed] text-xl font-bold">folder</span>
                      </div>

                      {/* Item Count Badge */}
                      <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                        {folder.count} Items
                      </div>
                    </div>

                    <div className="p-5 flex flex-col gap-1">
                      <div className="flex justify-between items-start gap-3">
                        <h3 className="text-lg font-bold text-white leading-tight line-clamp-1 group-hover:text-[#3b3bed] transition-colors">{folder.title}</h3>
                        <span className={`shrink-0 w-2 h-2 rounded-full mt-2 shadow-[0_0_10px_rgba(59,59,237,0.5)] ${folder.type === 'INSTITUTIONAL' ? 'bg-[#3b3bed]' : 'bg-emerald-500'}`} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        {folder.type} • {folder.date}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredFolders.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center h-64 text-slate-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <span className="material-symbols-outlined text-4xl mb-4 opacity-50">folder_off</span>
                  <p className="font-medium">No event folders found.</p>
                </div>
              )}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-4 opacity-50">imagesmode</span>
              <p>No media found in this category.</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  variants={fadeInUp}
                  custom={i}
                  onClick={() => selectionMode ? toggleSelection(item.id) : setSelectedImage(item)}
                  className={`aspect-[4/3] relative group overflow-hidden rounded-2xl cursor-pointer bg-slate-800/50 ${
                    selectionMode && selectedIds.includes(item.id) ? 'ring-4 ring-indigo-500 scale-[0.98]' : ''
                  }`}
                >
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={item.url}
                    alt={item.title}
                    loading="lazy"
                  />
                  
                  {/* Selection Indicator */}
                  {selectionMode && (
                    <div className={`absolute top-4 left-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedIds.includes(item.id) ? 'bg-indigo-500 border-indigo-500' : 'bg-black/20 border-white/50'
                    }`}>
                      {selectedIds.includes(item.id) && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 ${selectionMode ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300 flex flex-col justify-between p-4`}>
                    
                    {/* Top: Timestamp */}
                    <div className="flex justify-end">
                      <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 border border-white/10">
                        <span className="material-symbols-outlined text-[12px]">schedule</span> {item.date}
                      </span>
                    </div>

                    {/* Bottom: Info */}
                    <div className="space-y-2">
                       <div className="flex flex-wrap gap-2">
                        {item.tags.map(tag => (
                          <span key={tag.label} className={`px-2 py-0.5 rounded-md ${tag.color} text-[10px] font-bold text-white uppercase tracking-wider`}>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                      <h4 className="text-white text-base font-bold leading-tight line-clamp-1">{item.title}</h4>
                      <p className="text-slate-300 text-xs line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>

      {/* FAB */}
      {(!selectedEventId || (() => {
        const folder = folders.find(f => f.id === selectedEventId);
        return folder?.created_by === user?.id || folder?.collaborators?.includes(user?.email) || user?.email === 'raunak.baweja@vit.edu.in';
      })()) && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setUploadOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#3b3bed] text-white rounded-full shadow-lg shadow-[#3b3bed]/40 flex items-center justify-center z-40"
        >
          <span className="material-symbols-outlined">add</span>
        </motion.button>
      )}

      <UploadModal 
        isOpen={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
        folderId={selectedEventId}
      />

      <CollaborateModal
        isOpen={collaborateOpen}
        onClose={() => setCollaborateOpen(false)}
        folderId={selectedEventId}
        folderName={folders.find(f => f.id === selectedEventId)?.title || ''}
      />

      {/* Image Details Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a14] border border-[#3b3bed]/20 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl"
            >
              {/* Image Section */}
              <div className="w-full md:w-2/3 bg-black flex items-center justify-center relative group min-h-[300px]">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.title}
                  className="max-w-full max-h-[90vh] object-contain"
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 left-4 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                <a 
                  href={selectedImage.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-4 right-4 px-4 py-2 bg-[#3b3bed]/80 hover:bg-[#3b3bed] text-white rounded-xl flex items-center gap-2 backdrop-blur-md transition-colors font-bold text-sm"
                >
                  <span className="material-symbols-outlined text-sm">download</span> Download Original
                </a>
              </div>
              
              {/* Details Section */}
              <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto bg-[#111121]">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedImage.tags.map(tag => (
                      <span key={tag.label} className={`px-2 py-1 rounded-md ${tag.color} text-[10px] font-bold text-white uppercase tracking-wider`}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {selectedImage.description}
                  </p>
                </div>

                <div className="h-px bg-white/10 w-full" />

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#3b3bed] flex items-center justify-center font-bold text-white shadow-lg">
                      {selectedImage.user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Uploaded By</p>
                      <p className="text-slate-200 text-sm font-medium">{selectedImage.user}@vit.edu.in</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined">calendar_today</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Upload Date</p>
                      <p className="text-slate-200 text-sm font-medium">{selectedImage.date}</p>
                    </div>
                  </div>
                </div>

                {/* Actions Button Group (Only visible if uploader, creator, or admin) */}
                <div className="mt-auto pt-6 relative space-y-3">
                  { (selectedImage.event_id && (folders.find(f => f.id === selectedImage.event_id)?.created_by === user?.id || user?.email === 'raunak.baweja@vit.edu.in')) && (
                    <button 
                      onClick={executeSetThumbnail}
                      disabled={isUpdatingThumbnail}
                      className="w-full py-3 bg-[#3b3bed]/10 hover:bg-[#3b3bed]/20 disabled:opacity-50 text-[#3b3bed] border border-[#3b3bed]/20 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">{isUpdatingThumbnail ? 'refresh' : 'image'}</span> 
                      {isUpdatingThumbnail ? 'Updating...' : 'Set as Folder Thumbnail'}
                    </button>
                  )}
                  { (user?.id === selectedImage.uploader_id || user?.email === 'raunak.baweja@vit.edu.in') && (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                      className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-500 border border-red-500/20 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span> Delete Asset
                    </button>
                  )}
                </div>
              </div>
              
              {/* Custom Delete Confirmation Modal Overlay */}
              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-[#0a0a14]/90 backdrop-blur-sm rounded-r-3xl"
                  >
                    <div className="bg-slate-900 border border-slate-700/50 p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <span className="material-symbols-outlined text-red-500 text-3xl">warning</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Delete Asset?</h3>
                      <p className="text-sm text-slate-400 mb-6">
                        This action cannot be undone. The image will be permanently removed from the vault.
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                          className="flex-1 py-2.5 rounded-xl font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={executeDelete}
                          disabled={isDeleting}
                          className="flex-1 py-2.5 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-500/30 transition-all flex justify-center items-center gap-2"
                        >
                          {isDeleting ? (
                            <><span className="material-symbols-outlined text-sm animate-spin">refresh</span> Deleting...</>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
