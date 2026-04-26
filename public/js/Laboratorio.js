document.addEventListener("DOMContentLoaded", async () => {
    const divFormulario = document.getElementById("filtros");
    const selectMostrar = document.getElementById("cantidad");
    const btnBuscar = document.getElementById("btnBuscar");
    const DateDesde = document.getElementById("desde");
    const DateHasta = document.getElementById("hasta");
    const tabla = document.getElementById("tabla");

    function activarEventosIconos() {
        const iconos = document.querySelectorAll(".icono-editar");

        iconos.forEach(icono => {
            icono.addEventListener("click", () => {
                const info = JSON.parse(icono.dataset.info);
                abrirModalSegunProducto(info);
            });
        });
    }

    function renderizarTabla(analiticas) {
        const tabla = document.getElementById("tabla");

        // Limpiar tabla excepto cabecera
        tabla.querySelectorAll("tr:not(:first-child)").forEach(tr => tr.remove());

        for (const producto in analiticas) {
            const filas = analiticas[producto];
            const nombreMostrar = nombres[producto.toLowerCase()] ?? producto;

            // CASO ESPECIAL: STRING
            if (typeof filas === "string") {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${nombreMostrar}</td>
                <td>${filas}</td>
                <td></td>
                <td></td>
                <td>
                    <img src="images/editar_azul_icon_20x20.png"
                         class="icono-editar"
                         data-info='${JSON.stringify({ producto, producciones: filas })}'
                         title="Editar fabricación">
                </td>
            `;
                tabla.appendChild(tr);
                continue;
            }

            // CASO ERROR
            if (filas.error) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${nombreMostrar}</td>
                <td colspan="4" style="color:red;">${filas.error}</td>
            `;
                tabla.appendChild(tr);
                continue;
            }

            // CASO SIN PRODUCCIONES
            if (!Array.isArray(filas) || filas.length === 0) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${nombreMostrar}</td>
                <td colspan="4">Sin producciones pendientes</td>
            `;
                tabla.appendChild(tr);
                continue;
            }

            // CASO NORMAL
            filas.forEach(fila => {
                const fechaRaw = fila.Fecha ?? fila.Hora_Inicio ?? fila.Hora_Finalizacion ?? "";
                const fecha = formatearFecha(fechaRaw);

                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${nombreMostrar}</td>
                <td>${fila.NumeroFabricacion ?? ""}</td>
                <td>${fecha}</td>
                <td>${fila.Estado ?? ""}</td>
                <td>
                    <img src="images/editar_azul_icon_20x20.png"
                         class="icono-editar"
                         data-info='${JSON.stringify(fila)}'
                         title="Editar fabricación">
                </td>
            `;
                tabla.appendChild(tr);
            });
        }

        activarEventosIconos();
    }

    function abrirModalSegunProducto(info) {
        document.getElementById("productoAnalitica").value = info.producto ?? "";
        document.getElementById("fabricacionAnalitica").value = info.NumeroFabricacion ?? "";

        const contenedor = document.getElementById("contenedorCamposAnalitica");
        contenedor.innerHTML = obtenerCamposAnalitica(info.producto);

        abrirModalGenerico("modalAnalitica");
    }

    document.getElementById("cerrarModalAnalitica").addEventListener("click", () => {
        cerrarModalGenerico("modalAnalitica");
    });


    document.getElementById("formAnalitica").addEventListener("submit", async (e) => {
        e.preventDefault();

        const producto = document.getElementById("productoAnalitica").value;
        const fabricacion = document.getElementById("fabricacionAnalitica").value;

        const datos = recogerDatosAnalitica(producto);

        console.log(datos); debugger
        datos.producto = producto;
        datos.numeroFabricacion = fabricacion;

        // === GUARDAR EN BACKEND ===
        const respuesta = await fetch("index.php?c=Laboratorio&a=guardarAnaliticaFerrico", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();
        console.log("Resultado guardado:", resultado); debugger

        cerrarModalGenerico("modalAnalitica");
    });

    DateDesde.addEventListener("change", () => {
        console.log(DateDesde.value);
    });

    DateHasta.addEventListener("change", () => {
        console.log(DateHasta.value);
    });

    // Obtener productos fabricados    
    const data = await cargarProductos();
    const productos = data.productos;

    // Generar checkboxes
    generarCheckBoxesProductos(productos);

    // Obtener archivo config.json
    const config = await CargarConfig();
    const min = config.limitesSelect.inferior;
    const max = config.limitesSelect.superior;

    // Generar select
    configurarSelectCantidad(config);    

    btnBuscar.addEventListener("click", async () => {
        const productosSeleccionados = [...document.querySelectorAll("input[name='producto']:checked")]
            .map(cb => cb.value);

        const limite = selectMostrar.value;
        const desde = DateDesde.value;
        const hasta = DateHasta.value;

        // Llamada a tu función que obtiene analíticas con filtros
        const respuesta = await obtenerAnaliticas(productosSeleccionados, limite, desde, hasta);

        // Aquí refrescas la tabla como ya haces más abajo
        renderizarTabla(respuesta.analiticas);
    });
    

    // Mostrar tabla
    // Limpiar tabla excepto cabecera
    tabla.querySelectorAll("tr:not(:first-child)").forEach(tr => tr.remove());
    const respuesta = await obtenerAnaliticas();
    const analiticas = respuesta.analiticas;

    for (const producto in analiticas) {
        const filas = analiticas[producto];

        const nombreMostrar = nombres[producto.toLowerCase()] ?? producto;

        // -------------------------
        // CASO ESPECIAL: P18 → STRING
        // -------------------------
        if (typeof filas === "string") {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${nombreMostrar}</td>
                <td>${filas}</td>
                <td></td>
                <td></td>
                <td>
                    <img src="images/editar_azul_icon_20x20.png"
                         class="icono-editar"
                         data-info='${JSON.stringify({ producto, producciones: filas })}'
                         title="Editar fabricación">
                </td>
            `;
            tabla.appendChild(tr);
            continue;
        }

        // -------------------------
        // CASO ERROR
        // -------------------------
        if (filas.error) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${nombreMostrar}</td>
                <td colspan="4" style="color:red;">${filas.error}</td>
            `;
            tabla.appendChild(tr);
            continue;
        }

        // -------------------------
        // CASO SIN PRODUCCIONES
        // -------------------------
        if (!Array.isArray(filas) || filas.length === 0) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${nombreMostrar}</td>
                <td colspan="4">Sin producciones pendientes</td>
            `;
            tabla.appendChild(tr);
            continue;
        }

        // -------------------------
        // CASO NORMAL → ARRAY
        // -------------------------
        filas.forEach(fila => {
            const fechaRaw = fila.Fecha ?? fila.Hora_Inicio ?? fila.Hora_Finalizacion ?? "";
            const fecha = formatearFecha(fechaRaw);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${nombreMostrar}</td>
                <td>${fila.NumeroFabricacion ?? ""}</td>
                <td>${fecha}</td>
                <td>${fila.Estado ?? ""}</td>
                <td>
                    <img src="images/editar_azul_icon_20x20.png"
                         class="icono-editar"
                         data-info='${JSON.stringify({ ...fila, producto })}'
                         title="Editar fabricación">
                </td>
            `;
            tabla.appendChild(tr);
        });
    }
    activarEventosIconos();
}); 
