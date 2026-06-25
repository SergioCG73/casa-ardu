document.addEventListener("DOMContentLoaded", async () => {
    const divFormulario = document.getElementById("filtros");
    const selectMostrar = document.getElementById("cantidad");
    const selectAnalitica = document.getElementById("filtroAnalitica");
    const btnBuscar = document.getElementById("btnBuscar");
    const DateDesde = document.getElementById("desde");
    const DateHasta = document.getElementById("hasta");
    const tabla = document.getElementById("tabla");
    const desde = DateDesde.value ? DateDesde.value : null;

    function activarEventosIconos() {
        const iconos = document.querySelectorAll(".icono-editar");

        iconos.forEach(icono => {
            icono.addEventListener("click", () => {
                const info = JSON.parse(icono.dataset.info);
                //console.log(info); debugger
                abrirModalSegunProducto(info);
            });
        });
    }

    function renderizarTabla(analiticas) {
        const tabla = document.getElementById("tabla");

        tabla.querySelectorAll("tr:not(:first-child)").forEach(tr => tr.remove());

        for (const producto in analiticas) {

            let filas = analiticas[producto];
            
            if (filas && filas.datos) {
                filas = filas.datos;
            }

            const nombreMostrar = nombres[producto.toLowerCase()] ?? producto;

            // CASO ESPECIAL: STRING (P18)
            if (Array.isArray(filas) && typeof filas[0] === "string") {
                filas.forEach(num => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                    <td>${nombreMostrar}</td>
                    <td>${num}</td>
                    <td></td>
                    <td></td>
                    <td>
                        <img src="images/editar_azul_icon_20x20.png"
                             class="icono-editar"
                             data-info='${JSON.stringify({ producto, producciones: num })}'
                             title="Editar fabricación">
                    </td>
                `;
                    tabla.appendChild(tr);
                });
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

            // NORMALIZAR
            let pendientes = filas;

            if (pendientes && pendientes.datos) {
                pendientes = pendientes.datos;
            }

            if (!Array.isArray(pendientes) || pendientes.length === 0) {
                continue;
            }

            // CASO NORMAL
            pendientes = pendientes.slice(0, 15);
            pendientes.forEach(fila => {
                const fechaRaw = fila.Fecha ?? fila.Hora_Inicio ?? fila.Hora_Finalizacion ?? "";
                const fecha = formatearFecha(fechaRaw);
                const tr = document.createElement("tr");

                let color = "green";
                if (fila.Valoracion === 3 || fila.Analitica === 3) {
                    color = "red";
                } else if (fila.Valoracion === 2 || fila.Analitica === 2) {
                    color = "orange";
                } else if (fila.Valoracion === 1 || fila.Analitica === 1) {
                    color = "yellow";
                } else if (fila.Valoracion === null || fila.Analitica === null) {
                    color = "grey";
                }

                const circulo = `
                <span style="
                display:inline-block;
                width:14px;
                height:14px;
                border-radius:50%;
                background:${color};
                border:1px solid #555;"></span>`;

                tr.innerHTML = `
                <td>${nombreMostrar}</td>
                <td>${fila.NumeroFabricacion ?? fila.Fabricaciones ?? ""}</td>
                <td>${fecha}</td>
                <td>${circulo}</td>
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

        const producto = Object.keys(analiticas)[0];
        const info = analiticas[producto];

        if (info && info.totalPaginas) {
            renderizarPaginador(info.totalPaginas, info.paginaActual);
        }

        activarEventosIconos();
    }

    window.renderizarTabla = renderizarTabla;

    function renderizarPaginador(totalPaginas, paginaActual) {
        const cont = document.getElementById("paginador");
        cont.innerHTML = "";

        const maxBotones = 5; // ← número máximo de botones visibles
        let inicio = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
        let fin = Math.min(totalPaginas, inicio + maxBotones - 1);

        // Ajuste si estamos al final
        if (fin - inicio + 1 < maxBotones) {
            inicio = Math.max(1, fin - maxBotones + 1);
        }

        // Botón anterior
        if (paginaActual > 1) {
            const prev = document.createElement("button");
            prev.textContent = "Anterior";
            prev.onclick = () => cargarPagina(paginaActual - 1);
            cont.appendChild(prev);
        }

        // Si no empieza en 1, mostrar "..."
        if (inicio > 1) {
            const dots = document.createElement("span");
            dots.textContent = "...";
            cont.appendChild(dots);
        }

        // Botones visibles
        for (let i = inicio; i <= fin; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            if (i === paginaActual) btn.style.fontWeight = "bold";
            btn.onclick = () => cargarPagina(i);
            cont.appendChild(btn);
        }

        // Si no termina en totalPaginas, mostrar "..."
        if (fin < totalPaginas) {
            const dots = document.createElement("span");
            dots.textContent = "...";
            cont.appendChild(dots);
        }

        // Botón siguiente
        if (paginaActual < totalPaginas) {
            const next = document.createElement("button");
            next.textContent = "Siguiente";
            next.onclick = () => cargarPagina(paginaActual + 1);
            cont.appendChild(next);
        }
    }

    

    function abrirModalSegunProducto(info) {
        //console.log(info); debugger
        document.getElementById("productoAnalitica").value = info.producto ?? "";

        document.getElementById("fabricacionAnalitica").value =
            info.NumeroFabricacion ??
            info.Fabricaciones ??
            "";

        document.getElementById("produccionesAnalitica").value =
            info.producciones ??
            info.Fabricaciones ??
            "";

        const contenedor = document.getElementById("contenedorCamposAnalitica");
        contenedor.innerHTML = obtenerCamposAnalitica(info.producto);

        for (const clave in info) {
            const input = contenedor.querySelector(`[name="${clave}"]`);
            if (input) {
                input.value = info[clave];
            }
        }

        if (info.NotasLab) {
            const obs = contenedor.querySelector('[name="Observaciones"]');
            if (obs) {
                obs.value = info.NotasLab;
            }
        }

        abrirModalGenerico("modalAnalitica");
    }

    document.getElementById("cerrarModalAnalitica").addEventListener("click", () => {
        cerrarModalGenerico("modalAnalitica");
    });

    // Formulario de búsqueda 
    document.getElementById("formAnalitica").addEventListener("submit", async (e) => {
        e.preventDefault();

        const producto = document.getElementById("productoAnalitica").value;
        const fabricacion = document.getElementById("fabricacionAnalitica").value;

        const datos = recogerDatosAnalitica(producto);
        datos.producto = producto;
        datos.numeroFabricacion = fabricacion;

        const prod = producto.toLowerCase();

        if (prod === "ferrico") {
            await fetch("index.php?c=Transferir&a=guardarAnaliticaFerrico", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            })
                .then(response => response.json())
                .then(datos => console.log(datos));

        } else if (prod === "sulfato") {
            await fetch("index.php?c=Transferir&a=guardarAnaliticaSulfato", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            })
                .then(response => response.json())
                .then(datos => console.log(datos));
        } else if (prod === "p18") {
            await fetch("index.php?c=Transferir&a=crearFiltrado", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            })
                .then(response => response.json())
                .then(datos => console.log(datos));
        }

        cerrarModalGenerico("modalAnalitica");

        setInterval(async () => {
            const resp = await fetch("index.php?c=Leer&a=leeranaliticas");
            const analiticasActualizadas = await resp.json();

            const respuesta = await obtenerAnaliticas();
            //console.log(respuesta); debugger
            renderizarTabla(analiticasActualizadas.analiticas);

        }, 600000); // Se refresca cada 10 minutos
    });

    configurarBuscador();

    btnBuscar.addEventListener("click", async () => {
        const productosSeleccionados = [...document.querySelectorAll("input[name='producto']:checked")]
            .map(cb => cb.value);

        const buscador = 1;
        //const limite = selectMostrar.value || 10;
        const desde = DateDesde.value;
        const hasta = DateHasta.value;
        const valorMin = document.getElementById("valor_min").value;
        const valorMax = document.getElementById("valor_max").value;

        // Llamada a tu función que obtiene analíticas con filtros
        const respuesta = await obtenerAnaliticas(productosSeleccionados, desde, hasta, buscador, valorMin, valorMax);

        console.log(respuesta); debugger

        // Refrescar la tabla
        renderizarTabla(respuesta.analiticas);
    });

    const productosIniciales = [...document.querySelectorAll("input[name='producto']:checked")]
        .map(cb => cb.value);


    //const respuesta = await obtenerAnaliticas(productosSeleccionados, selectMostrar.value, null, null, selectAnalitica.value);
    //const limiteInicial = selectMostrar.value || 10
    const respuesta = await obtenerAnaliticas(
        productosIniciales,
        //limiteInicial,
        null,
        null
    );

    //console.log(respuesta); debugger
    renderizarTabla(respuesta.analiticas);
}); 

