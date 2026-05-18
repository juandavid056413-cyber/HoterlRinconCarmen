document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-reserva");
  const lista = document.getElementById("lista-reservas");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const checkin = document.getElementById("checkin").value;
    const checkout = document.getElementById("checkout").value;
    const personas = document.getElementById("personas").value;

    const reserva = { checkin, checkout, personas };
    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    reservas.push(reserva);
    localStorage.setItem("reservas", JSON.stringify(reservas));

    mostrarReservas();
  });

  function mostrarReservas() {
    lista.innerHTML = "";
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    reservas.forEach((r) => {
      const li = document.createElement("li");
      li.textContent = `Check-in: ${r.checkin}, Check-out: ${r.checkout}, Personas: ${r.personas}`;
      lista.appendChild(li);
    });
  }

  mostrarReservas();
});
