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

async function sePuedeFabricar(producto, data) {
    // 1. Cargar festivos.json
    const res = await fetch("data/festivos.json");
    const json = await res.json();
    const festivos = json.festivos; // array YYYY-MM-DD

    // 2. Fecha y hora actual
    const ahora = new Date();
    const dia = ahora.getDay(); // 5 = viernes
    const horaActual = ahora.getHours();
    const minActual = ahora.getMinutes();

    // 3. Calcular si mañana es festivo
    const mañana = new Date(ahora);
    mañana.setDate(ahora.getDate() + 1);

    const yyyy = mañana.getFullYear();
    const mm = String(mañana.getMonth() + 1).padStart(2, "0");
    const dd = String(mañana.getDate()).padStart(2, "0");

    const fechaMañana = `${yyyy}-${mm}-${dd}`;
    const esVisperaFestivo = festivos.includes(fechaMañana);

    // 4. Equipos disponibles
    const mezcladoresDisponibles = data.equipos.filter(m => m.Tipo === "Mezclador" && m.Estado === "Vacio");
    const reactoresDisponibles = data.equipos.filter(r => r.Tipo === "Reactor" && r.Estado !== "Averiado");
    const mezcladoresUsados = data.equipos.filter(m => m.Tipo === "Mezclador" && m.Estado === "En uso");
    const reactoresDisponiblesSulfato = data.equipos.filter(r =>r.Tipo === "Reactor" && r.ProductoFabricado === "Sulfato" && r.Estado === "Vacio");

    console.log (reactoresDisponiblesSulfato); debugger

    // 5. Condiciones de bloqueo
    let tmargen;
    switch (producto) {
        case "P18":
            tmargen = 11;
            break;
        case "sulfato":
            tmargen = 5
            break;
        default:
            tmargen = 0; // por si llega un producto inesperado
            break;
    }

    const viernesTarde = (dia === 5 && (horaActual > tmargen || (horaActual === tmargen && minActual > 0)));
    const visperaFestivoTarde = (esVisperaFestivo && (horaActual > tmargen || (horaActual === tmargen && minActual > 0)));
    const noHayEquipos = (mezcladoresDisponibles.length === 0 || reactoresDisponibles.length === 0);

    // 6. Resultado final
    if (viernesTarde || visperaFestivoTarde || noHayEquipos) {
        console.log("NO se puede fabricar vispera festivo");
        mostrarModal("NO se puede fabricar");
        return false;
    }

    console.log("SÍ se puede fabricar");
    mostrarModal("SÍ se puede fabricar");
    return true;
}
