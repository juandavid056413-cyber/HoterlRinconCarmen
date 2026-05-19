document.addEventListener('DOMContentLoaded', () => {
  const currentUser = window.hotel?.getCurrentUser();
  if (!currentUser || currentUser.tipo !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  const roomList = document.getElementById('room-list');
  const reservationList = document.getElementById('reservation-list');
  const form = document.getElementById('form-habitacion');
  const msgEl = document.getElementById('room-message');

  const render = {
    rooms: () => {
      if (!roomList) return;
      const rooms = window.hotel.getHabitaciones();
      roomList.innerHTML = rooms.map(room => `
        <div class="admin-item">
          <strong>${room.nombre}</strong>
          <p>Camas: ${room.camas} · Max ${room.maxPersonas} personas · $${room.precio}/noche</p>
          <p>Servicios: ${room.servicios.join(', ')}</p>
          <button class="btn-small btn-delete-room" data-id="${room.id}">Eliminar</button>
        </div>
      `).join('');
    },
    reservations: () => {
      if (!reservationList) return;
      const reservas = window.hotel.getReservas();
      if (reservas.length === 0) {
        reservationList.innerHTML = '<p class="small-text">No hay reservas registradas.</p>';
        return;
      }
      reservationList.innerHTML = reservas.map((r, i) => {
        const usuario = window.hotel.getUsuarios().find(u => u.identificacion === r.identificacionUsuario) || {};
        return `
          <div class="admin-item">
            <strong>${r.nombreHabitacion}</strong>
            <p>Cliente: ${usuario.nombre || r.identificacionUsuario}</p>
            <p>${r.checkin} → ${r.checkout} · Personas: ${r.personas} · Total: $${r.total}</p>
            <button class="btn-small btn-cancel-reserva" data-index="${i}">Cancelar</button>
          </div>
        `;
      }).join('');
    },
    all: () => { render.rooms(); render.reservations(); }
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('room-name').value.trim();
      const camas = parseInt(document.getElementById('room-beds').value, 10);
      const maxPersonas = parseInt(document.getElementById('room-people').value, 10);
      const precio = parseFloat(document.getElementById('room-price').value, 10);
      const servicios = document.getElementById('room-services').value
        .split(',').map(s => s.trim()).filter(Boolean);

      if (!nombre || isNaN(camas) || isNaN(maxPersonas) || isNaN(precio)) {
        if (msgEl) msgEl.textContent = 'Por favor completa los datos correctamente.';
        return;
      }

      const rooms = window.hotel.getHabitaciones();
      const id = rooms.length ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
      rooms.push({ id, nombre, camas, maxPersonas, precio, servicios });
      window.hotel.saveHabitaciones(rooms);
      if (msgEl) msgEl.textContent = 'Habitación guardada correctamente.';
      form.reset();
      render.rooms();
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete-room')) {
      const rooms = window.hotel.getHabitaciones().filter(r => r.id !== parseInt(e.target.dataset.id, 10));
      window.hotel.saveHabitaciones(rooms);
      render.rooms();
    }
    if (e.target.matches('.btn-cancel-reserva')) {
      const reservas = window.hotel.getReservas();
      reservas.splice(parseInt(e.target.dataset.index, 10), 1);
      window.hotel.saveReservas(reservas);
      render.all();
    }
  });

  render.all();
});