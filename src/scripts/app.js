// src/scripts/app.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
    { id: 'folder_algo', name: 'ASD' },
    { id: 'folder_bd', name: 'Basis Data' },
    { id: 'folder_web', name: 'Pemrog. Web' },
    { id: 'folder_sop', name: 'Sistem Operasi' },
];

let allFiles = []; 
let currentState = { location: 'home', viewMode: 'grid', search: '', sortByAsc: false };
let isAdmin = false; 

// --- FORMAT DATE HELPER ---
function formatDate(dateStr) {
    if(!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// --- AUTH LOGIC ---
supabase.auth.onAuthStateChange((event, session) => {
    isAdmin = !!session;
    const btnLogin = document.getElementById('btn-login-modal');
    const btnLogout = document.getElementById('btn-logout');
    const btnUpload = document.getElementById('btn-upload');
    const listHeaderAksi = document.getElementById('list-header-aksi');

    if (isAdmin) {
        btnLogin.classList.add('hidden');
        btnLogout.classList.remove('hidden');
        btnUpload.classList.remove('hidden');
        btnUpload.classList.add('flex');
        if(listHeaderAksi) listHeaderAksi.style.display = 'block';
    } else {
        btnLogin.classList.remove('hidden');
        btnLogout.classList.add('hidden');
        btnUpload.classList.add('hidden');
        btnUpload.classList.remove('flex');
        if(listHeaderAksi) listHeaderAksi.style.display = 'none';
    }
    window.render();
});

// Modal Logic
window.openLoginModal = () => toggleModal('login-modal', true);
window.closeModal = (id) => toggleModal(id, false);
window.openAddModal = () => {
    document.getElementById('input-id').value = '';
    document.getElementById('input-label').value = '';
    document.getElementById('input-file').value = '';
    document.getElementById('modal-title').textContent = 'Upload File';
    toggleModal('form-modal', true);
};
window.openEditModal = (e, id) => {
    e.stopPropagation();
    const file = allFiles.find(f => f.id === id);
    if(!file) return;
    document.getElementById('input-id').value = file.id;
    document.getElementById('input-label').value = file.label;
    document.getElementById('input-parent').value = file.parent_id;
    document.getElementById('input-file').value = ''; 
    document.getElementById('modal-title').textContent = 'Edit File Info';
    toggleModal('form-modal', true);
};
window.confirmDelete = (e, id) => {
    e.stopPropagation();
    document.getElementById('delete-id').value = id;
    toggleModal('delete-modal', true);
};

function toggleModal(id, show) {
    const modal = document.getElementById(id);
    const box = document.getElementById(id + '-box');
    if (show) {
        modal.classList.replace('modal-exit', 'modal-enter');
    } else {
        modal.classList.replace('modal-enter', 'modal-exit');
    }
}

const toggleLoading = (show, text = "Processing...") => {
    const el = document.getElementById('loading-spinner');
    document.getElementById('loading-text').textContent = text;
    if(show) el.classList.replace('modal-exit', 'modal-enter');
    else setTimeout(() => el.classList.replace('modal-enter', 'modal-exit'), 300);
};

// --- CRUD & DB LOGIC ---
const loadData = async () => {
    toggleLoading(true, "Fetching data...");
    const { data, error } = await supabase.from('files').select('*').order('created_at', { ascending: false });
    toggleLoading(false);
    if (!error) {
        allFiles = data || [];
        window.render();
    }
};

window.executeLogin = async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    toggleLoading(true, "Verifying...");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    toggleLoading(false);
    if (error) window.showToast('Login failed.', 'error');
    else { window.closeModal('login-modal'); window.showToast('Welcome admin.'); }
};

window.executeLogout = async () => {
    await supabase.auth.signOut();
    window.showToast('Logged out.');
};

window.saveData = async () => {
    const id = document.getElementById('input-id').value;
    const label = document.getElementById('input-label').value;
    const parent_id = document.getElementById('input-parent').value;
    const file = document.getElementById('input-file').files[0];

    if (!label) return window.showToast('Title is required.', 'error');
    if (!id && !file) return window.showToast('File is required.', 'error');

    window.closeModal('form-modal');
    toggleLoading(true, "Saving...");

    try {
        let payload = { label, parent_id };
        if (file) {
            const ext = file.name.split('.').pop().toLowerCase();
            let originalName = file.name.substring(0, file.name.lastIndexOf('.'));
            let cleanName = originalName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
            const uniqueFileName = `${cleanName}.${ext}`;

            let fileType = 'code'; 
            if (['pdf'].includes(ext)) fileType = 'pdf';
            else if (['html', 'htm'].includes(ext)) fileType = 'html';
            else if (['zip', 'rar'].includes(ext)) fileType = 'zip';
            else if (['jpg', 'png', 'jpeg'].includes(ext)) fileType = 'img';

            let mimeType = file.type || 'application/octet-stream';
            if (fileType === 'html') mimeType = 'text/html';
            else if (fileType === 'pdf') mimeType = 'application/pdf';

            const { error: uploadError } = await supabase.storage.from('materi').upload(uniqueFileName, file, { contentType: mimeType, cacheControl: '3600', upsert: true });
            if (uploadError) throw new Error(uploadError.message);

            const { data: urlData } = supabase.storage.from('materi').getPublicUrl(uniqueFileName);
            let fileSizeStr = (file.size / 1024).toFixed(1) + ' KB';
            if (file.size > 1024 * 1024) fileSizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

            payload.name = urlData.publicUrl; 
            payload.size = fileSizeStr;
            payload.type = fileType;
        }

        let dbError;
        if (id) {
            const res = await supabase.from('files').update(payload).eq('id', id);
            dbError = res.error;
        } else {
            const res = await supabase.from('files').insert([payload]);
            dbError = res.error;
        }
        if (dbError) throw new Error(dbError.message);

        window.showToast('Saved successfully.');
        loadData(); 
    } catch (err) {
        window.showToast(err.message, 'error');
    } finally {
        toggleLoading(false);
    }
};

window.executeDelete = async () => {
    const id = document.getElementById('delete-id').value;
    window.closeModal('delete-modal');
    toggleLoading(true, "Deleting...");
    const { error } = await supabase.from('files').delete().eq('id', id);
    toggleLoading(false);
    if (!error) { window.showToast('File deleted.'); loadData(); }
};

// --- RENDER UI ---
function getIcon(type) {
    if (type === 'folder') {
        return `<svg class="w-8 h-8 text-zinc-300" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
    }
    const colors = { pdf: 'text-red-400', html: 'text-blue-400', zip: 'text-yellow-400', img: 'text-emerald-400', code: 'text-zinc-400' };
    const col = colors[type] || 'text-zinc-400';
    return `<svg class="w-8 h-8 ${col}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`;
}

function renderSidebar() {
    document.getElementById('category-list').innerHTML = categories.map(c => `
        <button onclick="window.navigate('${c.id}')" class="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors" id="nav-${c.id}">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            ${c.name}
        </button>
    `).join('');
}

function updateSidebarActive() {
    document.querySelectorAll('#category-list button, #nav-home, #nav-recent').forEach(btn => {
        btn.classList.remove('bg-white/10', 'text-zinc-100');
        btn.classList.add('text-zinc-400', 'hover:bg-white/5');
    });
    const active = document.getElementById(`nav-${currentState.location}`);
    if(active) {
        active.classList.remove('text-zinc-400', 'hover:bg-white/5');
        active.classList.add('bg-white/10', 'text-zinc-100');
    }
}

window.toggleSort = () => {
    currentState.sortByAsc = !currentState.sortByAsc;
    document.getElementById('sort-label').textContent = currentState.sortByAsc ? "Sort: Oldest" : "Sort: Newest";
    window.render();
}

// Tambahkan fungsi ini di atas fungsi window.render
window.copyLink = (e, url) => {
    e.stopPropagation(); // Biar filenya gak ikut kebuka pas kita klik tombol copy
    navigator.clipboard.writeText(url).then(() => {
        window.showToast('Link berhasil dicopy!', 'success');
    }).catch(err => {
        window.showToast('Gagal copy link.', 'error');
        console.error(err);
    });
};

// Timpa fungsi window.render lu yang lama dengan ini:
window.render = () => {
    updateSidebarActive();
    const contentArea = document.getElementById('content-area');
    const listHeader = document.getElementById('list-header');
    const breadcrumb = document.getElementById('breadcrumb-container');
    contentArea.innerHTML = '';
    let items = [];
    
    if (currentState.location === 'home') {
        items = categories.map(c => ({...c, kind: 'Folder'})).filter(c => c.name.toLowerCase().includes(currentState.search));
        breadcrumb.innerHTML = `<span class="text-zinc-100 font-semibold tracking-wide">All Files</span>`;
    } else if (currentState.location === 'recent') {
        items = [...allFiles].slice(0, 15).filter(f => f.label.toLowerCase().includes(currentState.search));
        breadcrumb.innerHTML = `<span class="text-zinc-100 font-semibold tracking-wide">Recent Files</span>`;
    } else {
        items = allFiles.filter(f => f.parent_id === currentState.location && (f.label.toLowerCase().includes(currentState.search)));
        const folderObj = categories.find(c => c.id === currentState.location);
        breadcrumb.innerHTML = `
            <span class="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" onclick="window.navigate('home')">Home</span>
            <span class="text-zinc-600">/</span>
            <div class="w-2 h-2 bg-blue-500 rounded-full mx-1"></div>
            <span class="text-zinc-100 font-semibold tracking-wide">${folderObj ? folderObj.name : 'Folder'}</span>
        `;
    }

    // Sort items
    items.sort((a, b) => {
        if (a.kind === 'Folder' && b.kind !== 'Folder') return -1;
        if (a.kind !== 'Folder' && b.kind === 'Folder') return 1;
        
        let valA = a.created_at || '';
        let valB = b.created_at || '';
        if(valA < valB) return currentState.sortByAsc ? -1 : 1;
        if(valA > valB) return currentState.sortByAsc ? 1 : -1;
        return 0;
    });

    document.getElementById('status-count').textContent = `${items.length} items`;

    if (currentState.viewMode === 'grid') {
        contentArea.className = "scroller flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start pb-10 px-6";
        listHeader.classList.add('hidden');
        listHeader.classList.remove('grid');
        
        if(items.length === 0) {
            contentArea.innerHTML = `<div class="col-span-full py-20 flex justify-center text-zinc-500 text-sm">No items found.</div>`;
            return;
        }

        items.forEach(item => {
            const el = document.createElement('div');
            const isFolder = item.kind === 'Folder';
            
            el.className = "group relative bg-[#222225] border border-white/5 rounded-xl p-3 hover:bg-[#2A2A2D] transition-colors cursor-pointer flex items-center gap-3";
            el.onclick = () => {
                if (isFolder) window.navigate(item.id);
                else window.open(item.name, '_blank');
            };

            // Tombol Copy (Untuk Semua Orang)
            const btnCopy = `<button onclick="window.copyLink(event, '${item.name}')" class="p-1 text-zinc-400 hover:text-blue-400 rounded transition-colors" title="Copy Link"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg></button>`;
            
            // Tombol Admin (Edit & Delete)
            const btnEdit = `<button onclick="window.openEditModal(event, '${item.id}')" class="p-1 text-zinc-400 hover:text-zinc-100 rounded transition-colors" title="Edit"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>`;
            const btnDelete = `<button onclick="window.confirmDelete(event, '${item.id}')" class="p-1 text-zinc-400 hover:text-red-400 rounded transition-colors" title="Delete"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>`;

            const actionButtons = isFolder ? '' : `
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10 bg-[#2A2A2D] p-0.5 rounded border border-white/10">
                    ${btnCopy}
                    ${isAdmin ? btnEdit + btnDelete : ''}
                </div>
            `;

            el.innerHTML = `
                ${actionButtons}
                <div class="shrink-0 drop-shadow-sm">${getIcon(isFolder ? 'folder' : item.type)}</div>
                <div class="flex flex-col min-w-0 pr-4">
                    <p class="text-sm font-semibold text-zinc-200 truncate w-full tracking-tight">${item.label || item.name}</p>
                    ${!isFolder ? `<p class="text-[10px] text-zinc-500 mt-0.5">${formatDate(item.created_at)}</p>` : ''}
                </div>
            `;
            contentArea.appendChild(el);
        });
    } else {
        contentArea.className = "scroller flex-1 overflow-y-auto flex flex-col px-6 pb-10";
        listHeader.classList.remove('hidden');
        listHeader.classList.add('grid');

        if(items.length === 0) {
            contentArea.innerHTML = `<div class="py-20 text-center text-zinc-500 text-sm">No items found.</div>`;
            return;
        }

        items.forEach(item => {
            const el = document.createElement('div');
            const isFolder = item.kind === 'Folder';

            el.className = "group grid grid-cols-12 gap-4 items-center px-2 py-3 border-b border-white/5 hover:bg-[#222225] transition-colors cursor-pointer rounded-lg";
            el.onclick = () => {
                if (isFolder) window.navigate(item.id);
                else window.open(item.name, '_blank');
            };

            const btnCopy = `<button onclick="window.copyLink(event, '${item.name}')" class="text-zinc-500 hover:text-blue-400 transition-colors" title="Copy Link"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg></button>`;
            const btnEdit = `<button onclick="window.openEditModal(event, '${item.id}')" class="text-zinc-500 hover:text-zinc-200 transition-colors" title="Edit"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>`;
            const btnDelete = `<button onclick="window.confirmDelete(event, '${item.id}')" class="text-zinc-500 hover:text-red-400 transition-colors" title="Delete"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>`;

            const actionButtons = isFolder ? '<div class="col-span-1"></div>' : `
                <div class="col-span-1 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${btnCopy}
                    ${isAdmin ? btnEdit + btnDelete : ''}
                </div>
            `;

            el.innerHTML = `
                <div class="col-span-5 flex items-center gap-3 font-medium text-sm text-zinc-200">
                    ${getIcon(isFolder ? 'folder' : item.type)}
                    <span class="truncate">${item.label || item.name}</span>
                </div>
                <div class="col-span-2 text-xs text-zinc-500 uppercase tracking-wider">${isFolder ? 'Folder' : item.type}</div>
                <div class="col-span-2 text-xs text-zinc-500">${isFolder ? '--' : item.size}</div>
                <div class="col-span-2 text-xs text-zinc-500">${isFolder ? '--' : formatDate(item.created_at)}</div>
                ${actionButtons}
            `;
            contentArea.appendChild(el);
        });
    }
}

window.navigate = (loc) => { 
    currentState.location = loc; 
    currentState.search = '';
    document.getElementById('search-input').value = '';
    window.render(); 
}

document.getElementById('search-input').addEventListener('input', (e) => { 
    currentState.search = e.target.value.toLowerCase(); 
    window.render(); 
});

window.showToast = (msg, type = 'success') => {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-icon');
    document.getElementById('toast-msg').textContent = msg;
    toast.className = "fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-[100] transition-all duration-300 font-medium text-xs border toast-enter " + (type === 'success' ? "bg-[#242427] text-zinc-100 border-white/10" : "bg-red-950/80 text-red-200 border-red-500/30");
    icon.innerHTML = type === 'success' 
        ? `<svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
        : `<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    setTimeout(() => { toast.classList.replace('toast-enter', 'toast-exit'); }, 3000);
};

document.getElementById('toggle-grid').onclick = (e) => { 
    currentState.viewMode = 'grid'; 
    e.currentTarget.classList.replace('bg-transparent', 'bg-white/10');
    e.currentTarget.classList.replace('text-zinc-500', 'text-zinc-100');
    const listBtn = document.getElementById('toggle-list');
    listBtn.classList.replace('bg-white/10', 'bg-transparent');
    listBtn.classList.replace('text-zinc-100', 'text-zinc-500');
    window.render(); 
};

document.getElementById('toggle-list').onclick = (e) => { 
    currentState.viewMode = 'list'; 
    e.currentTarget.classList.replace('bg-transparent', 'bg-white/10');
    e.currentTarget.classList.replace('text-zinc-500', 'text-zinc-100');
    const gridBtn = document.getElementById('toggle-grid');
    gridBtn.classList.replace('bg-white/10', 'bg-transparent');
    gridBtn.classList.replace('text-zinc-100', 'text-zinc-500');
    window.render(); 
};

renderSidebar();
loadData();