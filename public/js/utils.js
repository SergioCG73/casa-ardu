const nombres = {
    ferrico: "Férrico",
    sulfato: "Sulfato",
    p18: "P18",
    hb10: "HB10"
};

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

function abrirModalGenerico(idModal) {
    const modal = document.getElementById(idModal);
    if (!modal) return;

    modal.hidden = false;
    modal.style.display = "flex";
}

function cerrarModalGenerico(idModal) {
    const modal = document.getElementById(idModal);
    if (!modal) return;

    modal.hidden = true;
    modal.style.display = "none";
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

function formatearFecha(fechaStr) {
    if (!fechaStr) return "";

    const fecha = new Date(fechaStr);

    if (isNaN(fecha)) return fechaStr; // Si no se puede convertir, devolver tal cual

    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const año = fecha.getFullYear();

    const horas = String(fecha.getHours()).padStart(2, "0");
    const minutos = String(fecha.getMinutes()).padStart(2, "0");
    const segundos = String(fecha.getSeconds()).padStart(2, "0");

    return `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;
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
    const mezcladoresDisponibles = data.equipos.filter(m => m.Tipo === "Mezclador" && m.Estado === "Vacio" && m.Equipo_id != "M216");
    const mezcladoresUsados = data.equipos.filter(m => m.Tipo === "Mezclador" && m.Estado === "En uso" && m.Equipo_id != "M311" && m.Equipo_id != "M411");
    const reactoresDisponiblesP18 = data.equipos.filter(r => r.Tipo === "Reactor" && r.Estado !== "Averiado");
    const reactoresDisponiblesSulfato = data.reactores.filter(r => r.Tipo === "Reactor" && r.ProductoFabricado === "Sulfato" && r.Estado === "Vacio");

    // 5. Condiciones de bloqueo
    let tmargen;
    switch (producto) {
        case "P18":
            tmargen = 11;
            break;
        case "Sulfato":
            tmargen = 14;
            break;
        default:
            tmargen = 0; // por si llega un producto inesperado
            break;
    }

    const viernesTarde = (dia === 5 && (horaActual > tmargen || (horaActual === tmargen && minActual > 0)));
    const visperaFestivoTarde = (esVisperaFestivo && (horaActual > tmargen || (horaActual === tmargen && minActual > 0)));
    const noHayEquipos = (mezcladoresDisponibles.length === 0 || reactoresDisponiblesP18.length === 0 || mezcladoresUsados.length != 0);

    // 6. Resultado final
    if (producto === "P18" && (
        viernesTarde ||
        visperaFestivoTarde ||
        noHayEquipos)) {
        console.log("NO se puede fabricar vispera festivo");
        mostrarModal("No se puede fabricar");
        return false;
    }

    if (producto === "Sulfato" && (
        viernesTarde ||
        visperaFestivoTarde ||
        reactoresDisponiblesSulfato.length === 0 ||
        mezcladoresUsados.length != 0)) {
        console.log("NO se puede fabricar vispera festivo");
        mostrarModal("NO se puede fabricar");
        return false;
    }

    return true;
}

async function configurarBuscador() {
    // Leer JSON config.JSON
    const res = await fetch("index.php?c=Leer&a=leerJSON");
    const config = await res.json();

    // ============================
    // 1. Generar checkboxes
    // ============================
    const contenedor = document.querySelector("#productos");
    contenedor.innerHTML = "";

    const productos = config.productos;

    productos.forEach(p => {
        const nombre = typeof p === "string" ? p : p.ProductoFabricado;
        const id = "prod_" + nombre.replace(/\s+/g, "_");

        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = id;
        input.name = "producto";
        input.value = nombre;

        const label = document.createElement("label");
        label.setAttribute("for", id);
        label.textContent = nombre;

        contenedor.appendChild(input);
        contenedor.appendChild(label);
    });

    // =============================
    // 2. Configurar select cantidad
    // =============================
    const selectCantidad = document.getElementById("cantidad");
    selectCantidad.innerHTML = "";

    const minCant = config.limitesSelect.inferior;
    const maxCant = config.limitesSelect.superior;

    for (let i = minCant; i <= maxCant; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        selectCantidad.appendChild(option);
    }

    selectCantidad.value = 5;

    // =====================
    // 3. Limitar date Desde
    // =====================
    const dateDesde = document.getElementById("desde");

    if (config.fechas.minDesde) {
        dateDesde.min = config.fechas.minDesde;
    }

    // =============================
    // 4. Configurar select valor (rango)
    // =============================
    const selectMin = document.getElementById("valor_min");
    const selectMax = document.getElementById("valor_max");

    selectMin.innerHTML = "";
    selectMax.innerHTML = "";

    const minVal = config.valoresAnaliticas.inferior;
    const maxVal = config.valoresAnaliticas.superior;

    for (let a = minVal; a <= maxVal; a++) {
        const opt1 = document.createElement("option");
        opt1.value = a;
        opt1.textContent = a;
        selectMin.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = a;
        opt2.textContent = a;
        selectMax.appendChild(opt2);
    }

    // Valores por defecto
    selectMin.value = minVal;
    selectMax.value = maxVal;

}



/*async function generarCheckBoxesProductos() {
    const response = await fetch("index.php?c=Leer&a=leerproductos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "laboratorio" })
    });

    const data = await response.json();
    const productos = data.productos;
    //console.log(productos);

    const contenedor = document.querySelector("#productos");
    contenedor.innerHTML = "";

    productos.forEach(p => {
        const id = "prod_" + p.ProductoFabricado.replace(/\s+/g, "_");

        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = id;
        input.name = "producto";
        input.value = p.ProductoFabricado;

        const label = document.createElement("label");
        label.setAttribute("for", id);
        label.textContent = p.ProductoFabricado;

        contenedor.appendChild(input);
        contenedor.appendChild(label);
    })
}*/

/*async function configurarSelectCantidad() {
    const res = await fetch("index.php?c=Leer&a=leerJSON");
    const config = await res.json();

    const select = document.getElementById("cantidad");
    select.innerHTML = "";

    const min = config.limitesSelect.inferior;
    const max = config.limitesSelect.superior;

    for (let i = min; i <= max; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
    }
}*/

/*async function obtenerAnaliticas(productosSeleccionados = [], limite = null) {
    try {
        const response = await fetch("index.php?c=Leer&a=leeranaliticas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productosSeleccionados, limite, filtroAnalitica })
        });

        const data = await response.json();
        console.log("Analíticas cargadas:", data); debugger
        return data;

    } catch (error) {
        console.error("Error:", error);
        return { error: "Error al obtener analíticas" };
    }
}*/

async function obtenerAnaliticas(productosSeleccionados = [], limite = null, desde = null, hasta = null, buscador, valorMin = null, valorMax = null) {
    //console.log(valorMin, valorMax); debugger
    try {
        const response = await fetch("index.php?c=Laboratorio&a=obtenerAnaliticas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productosSeleccionados, limite, desde, hasta, buscador, valorMin, valorMax })
        });

        const data = await response.json();
        console.log("Analíticas cargadas:", data);
        return data;

    } catch (error) {
        console.error("Error:", error);
        return { error: "Error al obtener analíticas" };
    }
}


function obtenerCamposAnalitica(producto) {
    switch (producto.toUpperCase()) {
        case "P18":
            return `
        <label>Densidad:</label>
        <input type="number" step="0.01" id="densidad" name="Densidad">                
                
        <label>Riqueza:</label>
        <input type="number" step="0.01" id="riqueza" name="Riqueza">

        <label>Basicidad:</label>
        <input type="number" step="0.01" id="basicidad" name="Basicidad">

        <label>Observaciones:</label>
        <textarea id="observaciones" name="Observaciones"></textarea>
    `;


        case "FERRICO":
            return `
        <label>Densidad:</label>
        <input type="number" step="0.001" id="densidad" name="Densidad">

        <label>Riqueza:</label>
        <input type="number" step="0.01" id="riqueza" name="Riqueza">

        <label>Observaciones:</label>
        <textarea id="observaciones" name="Observaciones"></textarea>
    `;


        case "SULFATO":
            return `
        <label>Densidad:</label>
        <input type="number" step="0.001" id="densidad" name="Densidad">

        <label>pH:</label>
        <input type="number" step="0.01" id="ph" name="ph">

        <label>Riqueza:</label>
        <input type="number" step="0.01" id="riqueza" name="Riqueza">

        <label>Observaciones:</label>
        <textarea id="observaciones" name="Observaciones"></textarea>
    `;

    }
}

function recogerDatosAnalitica(producto) {
    switch (producto.toUpperCase()) {
        case "FERRICO":
            return {
                densidad: document.getElementById("densidad")?.value ?? null,
                riqueza: document.getElementById("riqueza")?.value ?? null,
                observaciones: document.getElementById("observaciones")?.value ?? null
                //acidez: document.getElementById("acidez")?.value ?? null,
            };

        case "P18":
            return {
                densidad: document.getElementById("densidad")?.value ?? null,
                riqueza: document.getElementById("riqueza")?.value ?? null,
                basicidad: document.getElementById("basicidad")?.value ?? null,
                observaciones: document.getElementById("observaciones")?.value ?? null,
                producciones: document.getElementById("produccionesAnalitica")?.value ?? null
            };

        case "SULFATO":
            return {
                densidad: document.getElementById("densidad")?.value ?? null,
                riqueza: document.getElementById("riqueza")?.value ?? null,
                ph: document.getElementById("ph")?.value ?? null,
                observaciones: document.getElementById("observaciones")?.value ?? null
                //alcalinidad: document.getElementById("alcalinidad")?.value ?? null
            };

        default:
            return {
                observaciones: document.getElementById("observaciones")?.value ?? null
            };
    }
}



