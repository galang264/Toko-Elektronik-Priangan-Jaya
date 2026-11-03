// FormLogin / FormRegistrasi (boundary) -> Sistem (REST API /api/auth/*)
const API = '/api/auth';

function tampilkanPesan(teks, jenis) {
  const el = document.getElementById('pesan');
  el.textContent = teks;
  el.className = `pesan ${jenis}`;
  el.hidden = false;
}

async function kirim(endpoint, body) {
  const res = await fetch(`${API}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan');
  return data;
}

// Membungkus submit agar tombol dinonaktifkan selama request berjalan
function pasangForm(id, handler) {
  const form = document.getElementById(id);
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tombol = form.querySelector('button');
    tombol.disabled = true;
    try {
      await handler(Object.fromEntries(new FormData(form)), form);
    } catch (err) {
      tampilkanPesan(err.message, 'error');
    } finally {
      tombol.disabled = false;
    }
  });
}

// MengisiFormRegistrasi() -> submitRegistrasi() -> validasiRegistrasi() -> cekUserSudahAda() -> simpanDataUser()
pasangForm('formRegistrasi', async (data, form) => {
  const { message } = await kirim('register', data);
  tampilkanPesan(message, 'sukses');
  form.reset();
});

// SubmitLogin() -> ProsesLogin() -> CekUser() -> alt hasil cek
pasangForm('formLogin', async ({ username, password }) => {
  const { token, user } = await kirim('login', { username, password });
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  tampilkanPesan('Login Berhasil', 'sukses');
});

// KlikLupaPassword() -> requestReset() -> cekEmail() -> kirimLinkReset()
pasangForm('formLupa', async ({ email }) => {
  const { message } = await kirim('lupa-password', { email });
  tampilkanPesan(message, 'sukses');
});

// Halaman tujuan dari link yang dikirim ke email
pasangForm('formReset', async ({ passwordBaru }, form) => {
  const token = new URLSearchParams(location.search).get('token');
  if (!token) throw new Error('Token tidak ditemukan pada link');
  const { message } = await kirim('reset-password', { token, passwordBaru });
  tampilkanPesan(`${message}. Silakan login kembali.`, 'sukses');
  form.reset();
});