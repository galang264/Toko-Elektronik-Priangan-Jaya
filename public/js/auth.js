const API = '/api/auth';
const DEMO_MODE = window.PJ_CONFIG?.demoMode === true;


function tampilkanPesan(teks, jenis) {
  const el = document.getElementById('pesan');
  if (!el) return;
  el.textContent = teks;
  el.className = `auth-message ${jenis}`;
  el.hidden = false;
}

async function kirim(endpoint, body) {
  if (DEMO_MODE) return window.PJDemoStore.auth(endpoint, body);
  const res = await fetch(`${API}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan. Silakan coba lagi.');
  return data;
}

function pasangForm(id, handler) {
  const form = document.getElementById(id);
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const tombol = form.querySelector('button[type="submit"]');
    tombol.disabled = true;
    const labelAwal = tombol.textContent;
    tombol.textContent = 'Memproses...';
    try {
      await handler(Object.fromEntries(new FormData(form)), form);
    } catch (error) {
      tampilkanPesan(error.message, 'error');
    } finally {
      tombol.disabled = false;
      tombol.textContent = labelAwal;
    }
  });
}

pasangForm('formRegistrasi', async (data, form) => {
  const { message } = await kirim('register', data);
  tampilkanPesan(message || 'Registrasi berhasil. Silakan masuk menggunakan akun baru.', 'sukses');
  form.reset();
  window.setTimeout(() => { window.location.href = '/login.html'; }, 1600);
});

pasangForm('formLogin', async ({ username, password }) => {
  const { token, user } = await kirim('login', { username, password });
  if (!token || !user) throw new Error('Respons login tidak lengkap. Silakan hubungi administrator.');
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  tampilkanPesan('Login berhasil. Mengalihkan ke dashboard...', 'sukses');
  window.setTimeout(() => { window.location.replace('/dashboard.html'); }, 450);
});

pasangForm('formLupa', async ({ email }) => {
  const { message } = await kirim('lupa-password', { email });
  tampilkanPesan(message || 'Jika email terdaftar, tautan reset akan dikirim.', 'sukses');
});

pasangForm('formReset', async ({ passwordBaru }, form) => {
  const token = new URLSearchParams(window.location.search).get('token');
  if (!token) throw new Error('Token tidak ditemukan pada tautan reset.');
  const { message } = await kirim('reset-password', { token, passwordBaru });
  tampilkanPesan(`${message || 'Password berhasil diubah'}. Silakan masuk kembali.`, 'sukses');
  form.reset();
  window.setTimeout(() => { window.location.href = '/login.html'; }, 1800);
});

// Akun contoh untuk mencoba seluruh tampilan sebelum backend siap.
document.querySelectorAll('[data-demo-username]').forEach((button) => {
  button.addEventListener('click', () => {
    const username = button.dataset.demoUsername;
    const password = button.dataset.demoPassword;
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (usernameInput && passwordInput) { usernameInput.value = username; passwordInput.value = password; passwordInput.focus(); }
  });
});
