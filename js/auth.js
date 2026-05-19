const HOTEL_STORAGE = {
  usuarios: 'hotel_usuarios',
  reservas: 'hotel_reservas',
  habitaciones: 'hotel_habitaciones',
  usuarioActual: 'hotel_usuario_actual'
};

const DEFAULT_ADMIN = {
  id: 'admin',
  identificacion: '00000000',
  nombre: 'Administrador',
  nacionalidad: 'Colombia',
  email: 'admin@hotel.com',
  telefono: '0000000000',
  password: 'admin123',
  tipo: 'admin'
};

const DEFAULT_ROOMS = [
  { id: 1, nombre: 'Suite con bañera', camas: 1, maxPersonas: 2, precio: 200, servicios: ['Internet', 'Jacuzzi'] },
  { id: 2, nombre: 'Moderna con minibar', camas: 1, maxPersonas: 2, precio: 180, servicios: ['Internet', 'Minibar'] },
  { id: 3, nombre: 'Doble panorámica', camas: 2, maxPersonas: 4, precio: 250, servicios: ['Internet'] },
  { id: 4, nombre: 'Con barcito', camas: 1, maxPersonas: 2, precio: 220, servicios: ['Internet', 'Bar privado'] },
  { id: 5, nombre: 'Dosel frente al mar', camas: 1, maxPersonas: 2, precio: 300, servicios: ['Internet', 'Terraza'] }
];

/* Funciones genéricas de almacenamiento */
const storage = {
  get: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value))
};

function ensureInitialData() {
  if (!storage.get(HOTEL_STORAGE.usuarios)) {
    storage.set(HOTEL_STORAGE.usuarios, [DEFAULT_ADMIN]);
  }
  if (!storage.get(HOTEL_STORAGE.habitaciones)) {
    storage.set(HOTEL_STORAGE.habitaciones, DEFAULT_ROOMS);
  }
  if (!storage.get(HOTEL_STORAGE.reservas)) {
    storage.set(HOTEL_STORAGE.reservas, []);
  }
}

/* API pública simplificada */
window.hotel = {
  ensureInitialData,
  getCurrentUser: () => storage.get(HOTEL_STORAGE.usuarioActual),
  getUsuarios: () => storage.get(HOTEL_STORAGE.usuarios) || [],
  saveUsuarios: (data) => storage.set(HOTEL_STORAGE.usuarios, data),
  getHabitaciones: () => storage.get(HOTEL_STORAGE.habitaciones) || [],
  saveHabitaciones: (data) => storage.set(HOTEL_STORAGE.habitaciones, data),
  getReservas: () => storage.get(HOTEL_STORAGE.reservas) || [],
  saveReservas: (data) => storage.set(HOTEL_STORAGE.reservas, data),
  setCurrentUser: (user) => storage.set(HOTEL_STORAGE.usuarioActual, user),
  clearCurrentUser: () => localStorage.removeItem(HOTEL_STORAGE.usuarioActual),
  registerUser: (data) => {
    const usuarios = window.hotel.getUsuarios();
    if (usuarios.some(u => u.email.toLowerCase() === data.email.toLowerCase() || u.identificacion === data.identificacion)) {
      return { ok: false, message: 'Ya existe un usuario con ese email o identificación.' };
    }
    usuarios.push(data);
    window.hotel.saveUsuarios(usuarios);
    window.hotel.setCurrentUser(data);
    return { ok: true };
  },
  loginUser: (email, password) => {
    const usuario = window.hotel.getUsuarios().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!usuario) return { ok: false, message: 'Email o contraseña incorrectos.' };
    window.hotel.setCurrentUser(usuario);
    return { ok: true, usuario };
  },
  logout: () => {
    window.hotel.clearCurrentUser();
    window.location.href = 'index.html';
  }
};

/* Inicializar y actualizar UI */
document.addEventListener('DOMContentLoaded', () => {
  ensureInitialData();
  
  const user = window.hotel.getCurrentUser();
  const logoutBtn = document.getElementById('logout-btn');
  const adminLink = document.querySelector('nav a[href="admin.html"]');
  const loginLink = document.querySelector('nav a[href="login.html"]');
  const registerLink = document.querySelector('nav a[href="registro.html"]');

  if (logoutBtn) logoutBtn.style.display = user ? 'inline-block' : 'none';
  if (adminLink) adminLink.style.display = user?.tipo === 'admin' ? 'inline-block' : 'none';
  if (loginLink) loginLink.style.display = user ? 'none' : 'inline-block';
  if (registerLink) registerLink.style.display = user ? 'none' : 'inline-block';

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.hotel.logout();
    });
  }

  /* Formulario de registro */
  const formRegistro = document.getElementById('form-registro');
  if (formRegistro) {
    formRegistro.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = window.hotel.registerUser({
        id: Date.now().toString(),
        identificacion: document.getElementById('id').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        nacionalidad: document.getElementById('nacionalidad').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        password: document.getElementById('password').value.trim(),
        tipo: 'cliente'
      });

      const msgEl = document.getElementById('mensaje-registro');
      if (msgEl) {
        msgEl.textContent = result.message || 'Registro exitoso. Redirigiendo...';
        msgEl.className = result.ok ? 'message success' : 'message error';
        if (result.ok) setTimeout(() => window.location.href = 'reservas.html', 1200);
      }
    });
  }

  /* Formulario de login */
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = window.hotel.loginUser(
        document.getElementById('login-email').value.trim(),
        document.getElementById('login-password').value.trim()
      );

      const msgEl = document.getElementById('mensaje-login');
      if (msgEl) {
        msgEl.textContent = result.message || 'Bienvenido. Redirigiendo...';
        msgEl.className = result.ok ? 'message success' : 'message error';
        if (result.ok) setTimeout(() => window.location.href = 'reservas.html', 900);
      }
    });
  }
});