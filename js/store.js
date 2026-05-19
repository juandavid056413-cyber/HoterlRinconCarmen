document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-reserva');
  const lista = document.getElementById('lista-reservas');
  const resultado = document.getElementById('resultado');
  const status = document.getElementById('reserva-status');
  const welcome = document.getElementById('user-welcome');
  
  const user = window.hotel.getCurrentUser();
  const habitaciones = window.hotel.getHabitaciones();

  if (welcome) {
    welcome.textContent = user 
      ? `Hola ${user.nombre}, puedes consultar fechas, revisar habitaciones disponibles y apartar.`
      : 'Debes iniciar sesión para apartar habitaciones. Puedes consultar disponibilidad sin compromiso.';
  }

  if (status && !user) {
    status.innerHTML = '<p class="alert">Inicia sesión o regístrate para reservar y cancelar.</p>';
  }

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const personas = parseInt(document.getElementById('personas').value, 10);

    if (!checkin || !checkout || !personas) {
      resultado.innerHTML = '<p class="message error">Por favor completa todos los campos.</p>';
      return;
    }

    const fechaInicio = new Date(checkin);
    const fechaFin = new Date(checkout);

    if (fechaFin <= fechaInicio) {
      resultado.innerHTML = '<p class="message error">La fecha de salida debe ser posterior a la de entrada.</p>';
      return;
    }

    const noches = Math.floor((fechaFin.setHours(0, 0, 0, 0) - fechaInicio.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));

    if (!Number.isFinite(noches) || noches <= 0) {
      resultado.innerHTML = '<p class="message error">Rango de fechas inválido.</p>';
      return;
    }

    const reservasExistentes = window.hotel.getReservas();
    const disponibles = habitaciones.filter(h => {
      if (h.maxPersonas < personas) return false;
      return !reservasExistentes.some(r =>
        r.idHabitacion === h.id &&
        !(new Date(checkout) <= new Date(r.checkin) || new Date(checkin) >= new Date(r.checkout))
      );
    });

    if (disponibles.length === 0) {
      resultado.innerHTML = '<p class="message error">No hay habitaciones disponibles para esas fechas y personas.</p>';
      return;
    }

    mostrarDisponibles(disponibles, checkin, checkout, personas, noches);
  });

  function mostrarDisponibles(disponibles, checkin, checkout, personas, noches) {
    resultado.innerHTML = '<h3>Habitaciones disponibles</h3>';
    const grid = document.createElement('div');
    grid.className = 'cards-grid';

    disponibles.forEach(room => {
      const total = room.precio * noches;
      const wrapper = document.createElement('div');
      wrapper.className = 'room-card';

      const card = document.createElement('hotel-room-card');
      card.setAttribute('room', JSON.stringify(room));
      wrapper.appendChild(card);

      const detalles = document.createElement('div');
      detalles.innerHTML = `
        <p class="small-text">Precio por noche: <strong style="color:#0b3a57;">$${room.precio}</strong></p>
        <p class="small-text">Total ${noches} noches: <strong style="color:#0b3a57;">$${total}</strong></p>
        <button class="btn btn-primary btn-reservar" data-id="${room.id}" data-checkin="${checkin}" data-checkout="${checkout}" data-personas="${personas}" data-total="${total}">Apartar</button>
      `;
      wrapper.appendChild(detalles);

      if (!user) {
        const btn = wrapper.querySelector('.btn-reservar');
        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Inicia sesión para reservar';
        }
      }

      grid.appendChild(wrapper);
    });

    resultado.appendChild(grid);
    attachReserveEvents();
  }

  function attachReserveEvents() {
    document.querySelectorAll('.btn-reservar').forEach(button => {
      button.addEventListener('click', () => {
        if (!user) {
          window.location.href = 'login.html';
          return;
        }

        const idHabitacion = parseInt(button.dataset.id, 10);
        const nombreHabitacion = habitaciones.find(h => h.id === idHabitacion)?.nombre;
        const idReserva = (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : `res_${Date.now()}_${Math.random().toString(16).slice(2)}`;

        const reserva = {
          idReserva,
          idHabitacion,
          nombreHabitacion,
          checkin: button.dataset.checkin,
          checkout: button.dataset.checkout,
          personas: parseInt(button.dataset.personas, 10),
          total: parseFloat(button.dataset.total),
          identificacionUsuario: user.identificacion
        };

        const reservas = window.hotel.getReservas();
        if (reservas.some(r =>
          r.idHabitacion === reserva.idHabitacion &&
          !(new Date(reserva.checkout) <= new Date(r.checkin) || new Date(reserva.checkin) >= new Date(r.checkout))
        )) {
          alert('⚠️ Esta habitación ya no está disponible en ese rango de fechas.');
          return;
        }

        reservas.push(reserva);
        window.hotel.saveReservas(reservas);
        resultado.innerHTML = '<p class="message success">Reserva registrada con éxito. Revisa tus reservas abajo.</p>';
        mostrarReservas();
      });
    });
  }

  function mostrarReservas() {
    if (!lista) return;
    if (!user) {
      lista.innerHTML = '';
      return;
    }

    const reservasUsuario = window.hotel.getReservas().filter(r => r.identificacionUsuario === user.identificacion);
    if (reservasUsuario.length === 0) {
      lista.innerHTML = '<li class="small-text">Aún no tienes reservas.</li>';
      return;
    }

    lista.innerHTML = reservasUsuario.map(r => `
      <li class="reservation-item">
        <h3>${r.nombreHabitacion}</h3>
        <p>Check-in: ${r.checkin}</p>
        <p>Check-out: ${r.checkout}</p>
        <p>Personas: ${r.personas}</p>
        <p>Total: $${r.total}</p>
        <button class="btn-small btn-cancelar" data-idreserva="${r.idReserva}">Cancelar reserva</button>
      </li>
    `).join('');

    document.querySelectorAll('.btn-cancelar').forEach(button => {
      button.addEventListener('click', () => {
        const idReserva = button.dataset.idreserva;
        const nuevas = window.hotel.getReservas().filter(r => r.idReserva !== idReserva);
        window.hotel.saveReservas(nuevas);
        resultado.innerHTML = '<p class="message success">Reserva cancelada. La habitación vuelve a estar disponible.</p>';
        mostrarReservas();
      });
    });
  }

  mostrarReservas();
});