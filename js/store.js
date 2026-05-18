// Datos iniciales de habitaciones
const habitaciones = [
  { id: 1, nombre: "Habitación Simple", precio: 100 },
  { id: 2, nombre: "Habitación Doble", precio: 180 },
  { id: 3, nombre: "Suite", precio: 250 }
];

// Guardar habitaciones en LocalStorage si no existen
if (!localStorage.getItem("habitaciones")) {
  localStorage.setItem("habitaciones", JSON.stringify(habitaciones));
}

// Función para guardar reserva
function guardarReserva(reserva) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  reservas.push(reserva);
  localStorage.setItem("reservas", JSON.stringify(reservas));
}

// Función para mostrar reservas guardadas
function mostrarReservas() {
  const lista = document.getElementById("lista-reservas");
  lista.innerHTML = "";
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  reservas.forEach((r, index) => {
    const li = document.createElement("li");
    li.textContent = `Reserva ${index + 1}: ${r.personas} personas del ${r.checkin} al ${r.checkout}`;
    lista.appendChild(li);
  });
}

// Lógica del formulario
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-reserva");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const checkin = document.getElementById("checkin").value;
      const checkout = document.getElementById("checkout").value;
      const personas = document.getElementById("personas").value;

      if (!checkin || !checkout || !personas) {
        document.getElementById("resultado").innerText = "Por favor completa todos los campos.";
        return;
      }

      if (checkout <= checkin) {
        document.getElementById("resultado").innerText = "La fecha de salida debe ser mayor que la de entrada.";
        return;
      }

      const reserva = { checkin, checkout, personas };
      guardarReserva(reserva);

      document.getElementById("resultado").innerText =
        `Reserva guardada: ${personas} personas del ${checkin} al ${checkout}`;

      mostrarReservas();
    });

    mostrarReservas();
  }
});
