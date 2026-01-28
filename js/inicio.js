document.addEventListener("DOMContentLoaded", init);

function init() {
    const btnP18 = document.getElementById("btnP18");
    const btnSulfato = document.getElementById("btnSulfato");
    const tabla = document.getElementById("tabla");
    const divProducciones = document.getElementById("producciones_en_curso");

    btnP18.disabled = true;
    localStorage.setItem("modo", "inicial");

    btnP18.addEventListener("click", () => {
        localStorage.removeItem("editarP18");
        localStorage.removeItem("modo");
        localStorage.setItem("modoP18", "crear");
        localStorage.setItem("producto", "p18");
        window.location.href = "formularioP18.html";
    });

    btnSulfato.addEventListener("click", () => {
        localStorage.removeItem("editarSulfato");
        localStorage.setItem("modoSulfato", "crearSulfato");
        localStorage.setItem("producto", "sulfato");
    });

    cargarProducciones(tabla, divProducciones, btnP18);
}

/* ============================================================
   CARGAR DATOS DESDE PHP
   ============================================================ */
function cargarProducciones(tabla, divProducciones, btnP18) {
    fetch("models/leer.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "inicial" })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.ok) return;

        tabla.innerHTML = generarEncabezado() + construirTabla(data);
        activarEventosTabla(tabla);

        if (sePuedeFabricarP18(data)) {
            btnP18.disabled = false;
        }

        divProducciones.style.display = "block";
    })
    .catch(err => console.error("Error cargando producciones:", err));
}

/* ============================================================
   TABLA
   ============================================================ */
function generarEncabezado() {
    return `
        <tr>
            <th>Producto</th>
            <th>Nº Fabricación</th>
            <th>Fecha/Hora Inicio</th>
            <th>Mezclador</th>
            <th>Reactor</th>
            <th>Receta</th>
            <th></th>
            <th></th>
        </tr>`;
}

function construirTabla(data) {
    return data.producciones_en_curso.map(p => `
        <tr>
            <td class="${p.Producto_id === 'P18' ? 'p18_destacado' : ''} producto_${p.Producto_id}">
                ${p.Producto_id}
            </td>
            <td>${p.NumeroFabricacion}</td>
            <td>${p.FechaInicio}</td>
            <td>${p.Mezclador}</td>
            <td>${p.Reactor}</td>
            <td>${p.Receta}</td>
            <td><img src="images/editar_azul_icon_20x20.png" class="icono-editar" data-info='${JSON.stringify(p)}'></td>
            <td><img src="images/basura_rojo_icon_15x20.png" class="icono-borrar"></td>
        </tr>
    `).join("");
}

/* ============================================================
   EVENTOS DE LA TABLA (DELEGACIÓN)
   ============================================================ */
function activarEventosTabla(tabla) {
    tabla.addEventListener("click", e => {
        if (e.target.classList.contains("icono-editar")) {
            const datos = JSON.parse(e.target.dataset.info);
            localStorage.setItem("editarP18", JSON.stringify(datos));
            localStorage.setItem("modoP18", "editar");
            window.location.href = "formularioP18.html";
        }

        if (e.target.classList.contains("icono-borrar")) {
            console.log("Se ha pulsado borrar");
        }
    });
}

/* ============================================================
   LÓGICA DE NEGOCIO: ¿SE PUEDE FABRICAR P18?
   ============================================================ */
function sePuedeFabricarP18(data) {
    const mezcladoresDisponibles = data.mezcladoresP18Disponibles ?? [];
    const mezcladoresAveriados = data.mezcladoresP18Averiados ?? [];
    const reactoresDisponibles = data.reactoresP18Disponibles ?? [];
    const reactoresAveriados = data.reactoresP18Averiados ?? [];

    const fecha = data.fecha_transferencia_mezclador;
    const diferenciaHoras = fecha
        ? (new Date() - new Date(fecha.replace(" ", "T"))) / 3600000
        : 0;

    // Validación mínima
    if (
        !reactoresDisponibles ||
        !mezcladoresDisponibles ||
        !mezcladoresAveriados ||
        !reactoresAveriados
    ) {
        console.warn("Faltan variables necesarias para evaluar P18");
        return false;
    }

    if (mezcladoresDisponibles.length === 0) {
        console.log("No hay mezcladores disponibles → NO se puede fabricar P18");
        return false;
    }

    // 1) Regla general
    if (
        (reactoresDisponibles.length >= 1 && mezcladoresDisponibles.length > 1) ||
        (reactoresDisponibles.length === 0 && diferenciaHoras >= 4)
    ) {
        console.log("Regla 1");
        return true;
    }

    // 2) Casos con mezcladores averiados
    if (
        mezcladoresAveriados.length === 1 &&
        mezcladoresDisponibles.length === 0 &&
        reactoresDisponibles.length <= 1 &&
        diferenciaHoras > 4
    ) {
        console.log("Regla 2.1");
        return false;
    }

    if (
        mezcladoresAveriados.length === 1 &&
        mezcladoresDisponibles.length === 1 &&
        reactoresDisponibles.length > 1 &&
        diferenciaHoras > 4
    ) {
        console.log("Regla 2.2");
        return true;
    }

    if (
        mezcladoresAveriados.length === 1 &&
        mezcladoresDisponibles.length >= 1 &&
        reactoresDisponibles.length === 1
    ) {
        console.log("Regla 2.3");
        return true;
    }

    // 3) Reglas con 1 reactor averiado
    if (
        reactoresAveriados.length === 1 &&
        mezcladoresDisponibles.length === 2 &&
        reactoresDisponibles.length === 0
    ) {
        console.log("Regla 2.4");
        return false;
    }

    if (
        reactoresAveriados.length === 1 &&
        mezcladoresDisponibles.length === 2 &&
        reactoresDisponibles.length === 1
    ) {
        console.log("Regla 2.5");
        return true;
    }

    if (
        reactoresAveriados.length === 1 &&
        mezcladoresDisponibles.length === 1
    ) {
        console.log("Regla 2.6");
        return false;
    }

    return false;
}
