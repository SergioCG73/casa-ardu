document.addEventListener("DOMContentLoaded", function()
{
    //Declaración de constantes y variables
    const btnP18 = document.getElementById("btnP18");
    btnP18.disabled = true;
    const btnSulfato = document.getElementById("btnSulfato");
    const div_producciones_en_curso = document.getElementById("producciones_en_curso");
    const tabla = document.getElementById("tabla");
    let siSePuedeFabricarP18 = false;

    //Definimos el estado inicial al abrir la página
    localStorage.setItem("modo", "inicial");
    const modo = localStorage.getItem("modo");
    console.log("modo: ", modo);

    //Agregamos el escuchadores a los botones
    btnP18.addEventListener("click", function(){
        localStorage.removeItem("editarP18");
        localStorage.removeItem("modo");
        localStorage.setItem("modoP18", "crear");
        localStorage.setItem("producto", "p18");
        window.location.href="formularioP18.html";        
    });

    btnSulfato.addEventListener("click", function(){
        localStorage.removeItem("editarSulfato");
        localStorage.setItem("modoSulfato", "crearSulfato");
        localStorage.setItem("producto", "sulfato");
        //window.location.href="formularioP18.html";
    })    

    //Cargar producciones en curso
    fetch("models/leer.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo })
        })
        .then(response => response.json())
        .then(data => {
            console.log("data: ", data);
            const mezcladoresDisponiblesP18 = data.mezcladoresP18Disponibles ?? [];
            const mezcladoresAveriadosP18 = data.mezcladoresP18Averiados ?? [];
            const reactoresDisponiblesP18 = data.reactoresP18Disponibles ?? [];
            const reactoresAveriadosP18 = data.reactoresP18Averiados ?? [];
            const fechaTransferenciaMezclador = data.fecha_transferencia_mezclador ?? null; 
            let diferenciaHoras = "";

            const ahora = new Date();            
        
            if (fechaTransferenciaMezclador) {
                const fechaTransferenciaDate = new Date(fechaTransferenciaMezclador.replace(" ", "T"));
                diferenciaHoras = (ahora - fechaTransferenciaDate) / (1000 * 60 * 60);        
            } else {
                console.log("No hay fecha de transferencia disponible");
            }
            
            /*console.log ("Mezcladores Disponibles: ", mezcladoresDisponiblesP18); 
            console.log("Mezcladores Averiados P18", mezcladoresAveriadosP18);
            console.log ("Reactores Disponibles P18: ", reactoresDisponiblesP18);  
            console.log ("Reactores Averiados P18: ", reactoresAveriadosP18);         
            console.log("Fecha Transferencia Mezclador: ", fechaTransferenciaMezclador);            
            console.log("Diferencia horas:", diferenciaHoras); */

            if (!data.ok) return;

            //Construir tabla
            let html = `
                <tr>
                    <th>Producto</th>
                    <th>Nº Fabricación</th>
                    <th>Fecha/Hora Inicio</th>
                    <th>Mezclador</th>                        
                    <th>Reactor</th>                                                
                    <th>Receta</th>
                    <th></th>
                    <th></th>
                </tr> 
                `;

            html += construirTabla(data);
            tabla.innerHTML = html;
            
            if (sePuedeFabricarP18()) {
                btnP18.disabled = false;
            }                        

            //console.log(sePuedeFabricarP18());


        function construirTabla(data) {

            let html = "";

            data.producciones_en_curso.forEach(p => { 
                html += `                    
                    <tr>
                        <td class="${p.Producto_id === 'P18' ? 'p18_destacado' : ''} producto_${p.Producto_id}">
                                ${p.Producto_id}
                        </td>
                        <td>${p.NumeroFabricacion}</td>
                        <td>${p.FechaInicio}</td>
                        <td>${p.Mezclador}</td>                        
                        <td>${p.Reactor}</td>
                        <td>${p.Receta}</td>
                        <td>
                            <img src="images/editar_azul_icon_20x20.png" 
                                alt="Editar" 
                                class="icono-editar"
                                data-info='${JSON.stringify(p)}'>                            
                        </td>
                        <td>
                            <img src="images/basura_rojo_icon_15x20.png" 
                                alt="Borrar"
                                class="icono-borrar">                            
                        </td>                        
                    </tr>`;
            });
            return html;
        }

    function sePuedeFabricarP18() {
        let siSePuedeFabricarP18 = false;

    // Validación mínima para evitar errores
        if (
            !reactoresDisponiblesP18 ||
            !mezcladoresDisponiblesP18 ||
            !mezcladoresAveriadosP18 ||
            !reactoresAveriadosP18 ||
            typeof diferenciaHoras === "undefined"
        ) {
            console.warn("Faltan variables necesarias para evaluar P18");
            return false;
        }

        if (mezcladoresDisponiblesP18.length === 0) {
            console.log("No hay mezcladores disponibles → NO se puede fabricar P18");
            return false;
        }

    // 1) Regla general
        if (
            (reactoresDisponiblesP18.length >= 1 && mezcladoresDisponiblesP18.length > 1) ||
            (reactoresDisponiblesP18.length === 0 && diferenciaHoras >= 4)
        ) {
            console.log("Regla 1");
            return true;
        }

    // 2) Casos con mezcladores averiados
        if (        
            mezcladoresAveriadosP18.length === 1 &&
            mezcladoresDisponiblesP18.length === 0 &&
            reactoresDisponiblesP18.length <= 1 &&
            diferenciaHoras > 4
        ) {
            console.log("Regla 2.1");
            return false;        

        } else if (
            mezcladoresAveriadosP18.length === 1 &&
            mezcladoresDisponiblesP18.length === 1 &&
            reactoresDisponiblesP18.length > 1 &&
            diferenciaHoras > 4
        ) {
            console.log("Regla 2.2");
            return true;

        } else if (
            mezcladoresAveriadosP18.length === 1 &&
            mezcladoresDisponiblesP18.length >= 1 &&
            reactoresDisponiblesP18.length === 1
        ) {
            console.log("Regla 2.3");
            return true;
        }

    // 3) Reglas con 1 reactor averiado
        if (
            reactoresAveriadosP18.length === 1 &&
            mezcladoresDisponiblesP18.length === 2 &&
            reactoresDisponiblesP18.length === 0
        ) {
            console.log("Regla 2.4");
            return false;

        } else if (
            reactoresAveriadosP18.length === 1 &&
            mezcladoresDisponiblesP18.length === 2 &&
            reactoresDisponiblesP18.length === 1
        ) {
            console.log("Regla 2.5");
            return true;

        } else if (
            reactoresAveriadosP18.length === 1 &&
            mezcladoresDisponiblesP18.length === 1
        ) {
            console.log("Regla 2.6");
            return false;
        }

        return siSePuedeFabricarP18;
    }

        if (siSePuedeFabricarP18 === true) {
            btnP18.disabled = false;
        }            
            tabla.innerHTML = html;
            //Mostrar el div
            div_producciones_en_curso.style.display = "block";            
            
            document.querySelectorAll('.icono-editar').forEach(icono => {
               icono.addEventListener('click', function() {
                const datos = JSON.parse(this.dataset.info);

                // Guardar datos para editar
                localStorage.setItem("editarP18", JSON.stringify(datos));

                // Indicar modo edición
                localStorage.setItem("modoP18", "editar");

                window.location.href = "formularioP18.html";
            });
            });
            
            document.querySelectorAll('.icono-borrar').forEach(icono => {
                icono.addEventListener("click", function() {
                    console.log("Se ha pulsado borrar");
                })
            })
            });
});
