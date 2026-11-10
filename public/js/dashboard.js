document.addEventListener("DOMContentLoaded", () => {
    // 1. Ambil data sesi (Asumsi token & data user disimpan saat login)
    // Fallback diset ke 'pelanggan' untuk keperluan demo jika sesi kosong
    const user = JSON.parse(localStorage.getItem('user')) || { nama: "Guest", role: "pelanggan" };
    
    document.getElementById('user-name').textContent = user.nama;
    document.getElementById('user-role').textContent = user.role;

    // 2. Definisi Menu Berdasarkan Hak Akses (Role)
    const roleMenus = {
        pelanggan: [
            { title: 'Ringkasan', icon: 'fa-chart-pie', id: 'ringkasan' },
            { title: 'Produk', icon: 'fa-box', id: 'produk' },
            { title: 'Garansi', icon: 'fa-shield-halved', id: 'garansi' }
        ],
        karyawan: [
            { title: 'Kasir', icon: 'fa-cash-register', id: 'kasir' },
            { title: 'Tambah Produk', icon: 'fa-circle-plus', id: 'tambah-produk' },
            { title: 'Riwayat Transaksi', icon: 'fa-clock-rotate-left', id: 'riwayat' },
            { title: 'Proses Garansi', icon: 'fa-screwdriver-wrench', id: 'proses-garansi' }
        ],
        owner: [
            { title: 'Tambah Produk', icon: 'fa-circle-plus', id: 'tambah-produk' },
            { title: 'Tambah Supplier', icon: 'fa-truck-field', id: 'tambah-supplier' },
            { title: 'Pengadaan', icon: 'fa-boxes-stacked', id: 'pengadaan' },
            { title: 'Buat Laporan', icon: 'fa-file-invoice-dollar', id: 'laporan' }
        ]
    };

    const sidebarMenu = document.getElementById('sidebar-menu');
    const pageTitle = document.getElementById('page-title');
    const mainContent = document.getElementById('main-content');
    
    // Pilih menu berdasarkan role (konversi ke lowercase untuk pencocokan aman)
    const activeMenus = roleMenus[user.role.toLowerCase()] || roleMenus['pelanggan'];

    // 3. Render Menu ke Sidebar
    activeMenus.forEach(menu => {
        const link = document.createElement('a');
        link.href = `#${menu.id}`;
        link.className = "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors group mb-1";
        link.innerHTML = `
            <i class="fa-solid ${menu.icon} w-5 h-5 mr-3 text-slate-400 group-hover:text-blue-600 transition-colors"></i> 
            ${menu.title}
        `;
        
        // Ganti konten dinamis saat menu diklik
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Hapus status aktif dari semua menu, lalu set yang diklik
            document.querySelectorAll('#sidebar-menu a').forEach(el => el.classList.remove('bg-blue-50', 'text-blue-600'));
            link.classList.add('bg-blue-50', 'text-blue-600');

            // Update Header & Konten
            pageTitle.textContent = menu.title;
            mainContent.innerHTML = `
                <div class="animate-fade-in">
                    <h3 class="text-xl font-bold text-slate-800 mb-4">Halaman ${menu.title}</h3>
                    <div class="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                        <p class="text-slate-600">Komponen data untuk <strong>${menu.title}</strong> akan di-load di sini melalui API Backend Anda.</p>
                    </div>
                </div>
            `;
        });

        sidebarMenu.appendChild(link);
    });

    // 4. Implementasi Fitur Logout
    document.getElementById('btn-logout').addEventListener('click', async () => {
        const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
        if (!confirmLogout) return;

        try {
            // Opsional: Hit endpoint logout backend jika menggunakan HttpOnly Cookies
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.warn("Gagal terhubung ke backend saat logout", error);
        } finally {
            // Bersihkan Sesi Klien
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            sessionStorage.clear();
            
            // Redirect ke Halaman Login
            window.location.href = '/login.html';
        }
    });
});