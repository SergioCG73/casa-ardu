function mostrarModal(mensaje) {
    const modal = document.getElementById("modal");
    document.getElementById("modalMsg").textContent = mensaje;
    modal.hidden = false;
    modal.style.display = "flex";
}

function cerrarModal() {
    const modal = document.getElementById("modal");
    modal.hidden = true;
    modal.style.display = "none";
    window.location.href = "index.php?c=Formulario&a=home";
}

function formatearNumero(input) {
    let valor = input.value;
    if (valor == null) return;
    valor = String(valor).replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    input.value = valor;
    return valor;
}

function formatearMiles(num) {
    return num
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}