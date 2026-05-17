document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-reserva");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const checkin = document.getElementById("checkin").value;
      const checkout = document.getElementById("checkout").value;
      const personas = document.getElementById("personas").value;
      document.getElementById("resultado").innerText =
        `Consulta: ${personas} personas del ${checkin} al ${checkout}`;
    });
  }
});
