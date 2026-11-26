document.addEventListener("DOMContentLoaded", () => {
    const btnRetroceder = document.querySelector(".btn-back");
    const btnGuardarProduccion = document.querySelector(".btn-save");
    const lote = document.querySelector("div.form-group input[name='lote']");
    const fecha = document.getElementById("fecha");
    const operario = document.getElementById("operario");
    const m511_peso_inicial = document.getElementById("m511_peso_inicial");
    const m511_peso_final = document.getElementById("m511_peso_final");
    const m511_agua_kg = document.getElementById("m511_agua_kg");
    const m511_carbonato_kg = document.getElementById("m511_carbonato_kg");
    const m511_agua_dosificada = document.getElementById("m511_agua_dosificada");
    const m512_peso_inicial = document.getElementById("m512_peso_inicial");
    const m512_peso_final = document.getElementById("m512_peso_final");
    const m512_p18_kg = document.getElementById("m512_p18_kg");
    const radioMezcladorM511 = document.querySelectorAll("input[name='chk_mezclador_ok']");
    const modo = localStorage.getItem("modo");
    const radiosMezclador = document.querySelectorAll("input[name='chk_mezclador_ok']");
    const notas = document.getElementById("observaciones");

    //const peso_agua_M512 = document.getElementById("peso_agua_M512");
    //const btnRetroceder = document.getElementById("btnRetroceder");
    //const divMezcladorM511 = document.getElementById("mezclador_M511");    
    //const btnCrear = document.getElementById("btnCrear");
    //const parDisplayProduccion = document.getElementById("displayProduccion");


    // ===== VARIABLES GLOBALES =====
    let producto = localStorage.getItem("producto");                                                 //hb10
    datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));
    //datosTransferencia = JSON.parse(localStorage.getItem("datosTransferencia"));   
    let pesoInicialM511;
    let pesoFinalM511;
    let pesoInicialM512;
    let pesoFinalM512;
    let p18Dosificado;
    let operador;
    let siguienteFabricacion;
    let volumenAgua;
    let carbonatoCalcico;
    let aguaOK;

    // === LISTENERS === 

    /*btnRetroceder.addEventListener("click", () => {
        //window.location.href = "index.php?c=Formulario&a=home";
    })*/

    btnGuardarProduccion.addEventListener("click", () => {
        console.log("Se ha pulsado Guardar Producción");        
        pesoInicialM511 = m511_peso_inicial.value;
        pesoFinalM511 = m511_peso_final.value;        
        //operador = operario.options[operario.selectedIndex]?.text ?? "";
        observaciones = notas.value;
        console.log(m511_agua_kg); 
        volumenAgua = m511_agua_kg.value;
        carbonatoCalcico = m511_carbonato_kg.value;
        aguaOK = m511_agua_dosificada.value;  
        pesoInicialM512 = m512_peso_inicial.value;        
        pesoFinalM512 = m512_peso_final.value;      
        p18Dosificado = m512_p18_kg.value;        
        
        /*console.log(pesoInicialM511);
        console.log(pesoFinalM511);
        console.log(operador);
        console.log(siguienteFabricacion);
        console.log(observaciones);        
        console.log(volumenAgua);
        console.log(carbonatoCalcico);
        console.log(aguaOK);
        debugger*/

        datos = new FormData();
        datos.append("pesoInicialM511", pesoInicialM511);
        datos.append("pesoFinalM511", pesoFinalM511);
        datos.append("operario", operador);
        datos.append("fabricacion", siguienteFabricacion);
        datos.append("volumenAgua", volumenAgua);
        datos.append("carbonatoCalcico", carbonatoCalcico);
        datos.append("aguaDosificada", aguaOK);
        datos.append("notas", observaciones)
        datos.append("pesoInicialM512", pesoInicialM512);
        datos.append("pesoFinalM512", pesoFinalM512);
        datos.append("p18Dosificado", p18Dosificado);        

        fetch("index.php?c=HB10&a=crear", {
            method: "POST",
            body: datos
        })
            .then(response => response.json())
            .then(json => {
                console.log(json); debugger
                window.location.href = "index.php?c=Formulario&a=home"; 
            })
            .catch(error => {
                console.log("Error: ", error);
            })

    })

    // ===== FUNCIONES =====
    function inicializarFormulario(modo, producto, datosEdicion) {
        console.log("Inicializando formulario....");
        console.log(modo, producto, datosEdicion);                         //crear. hb10, datosEdicion
        debugger

        let hoy = new Date();

        if (modo === "crear") {
            //divMezcladorM511.style.display = "block";
            siguienteFabricacion = Math.max(datosEdicion.ultimaAcabada, datosEdicion.ultimaEnCurso) + 1;
            siguienteFabricacion = formatearMiles(siguienteFabricacion);
            lote.value = siguienteFabricacion;

            // Fecha actual en formato YYYY-MM-DD
            fecha.value = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

            //Rellenar select de operarios
            cargarOperarios(datosEdicion.operarios);

            onCambioAguaDosificada();
        }
    }

    if (modo === "editar") {        
        console.log(datosEdicion);
        m511_peso_inicial.value = formatearMiles(datosEdicion.PesoInicialMezclador);
        m511_peso_final.value = formatearMiles(datosEdicion.PesoFinalMezclador);
        m511_agua_kg.value = formatearMiles(datosEdicion.Volumen_Agua);
        m511_carbonato_kg.value = formatearMiles(datosEdicion.PesoInicialReactor);
        m512_peso_inicial.value = formatearMiles(datosEdicion.PesoFinalReactor);
        m512_peso_final.value = formatearMiles(datosEdicion.M512Final);
        lote.value = formatearMiles(datosEdicion.NumeroFabricacion);
        m512_p18_kg.value = formatearMiles(DatosEdicion.p18Dosificado)
        
        //operario.value = //Falta guardar el operario y devolverlo
        //notas.value = // tengo que leer el registro de la base de datos porque no viene con los datos generados de la tabla de home

    }

    function aguaDosificada() {
        return document.querySelector("input[name='chk_mezclador_ok']:checked")?.value === "1";
    }

    function onCambioAguaDosificada() {
        if (aguaDosificada()) {
            console.log("Sí");
            // Aquí tu lógica para "Sí"
        } else {
            console.log("No");
            // Aquí tu lógica para "No"
        }
    }

    radiosMezclador.forEach(radio => radio.addEventListener("change", onCambioAguaDosificada));

    // === MODO CREAR ===
    if (modo === "crear") {
        console.log("Modo crear...");

        const datos = new FormData();
        datos.append("producto", producto);
        datos.append("modo", modo);

        return fetch("index.php?c=Leer&a=leerHB10", {
            method: "POST",
            body: datos
        })
            .then(response => response.json())
            .then(json => {
                datosEdicion = json;
                console.log(datosEdicion);                                   //equipos (2), notas[], recetas[{..}], ultimaAcabada: 1009, ultimaEnCurso: false                

                if (datosEdicion.ok) {
                    console.log("datosEdicion.ok");
                } else {
                    alert("Error: " + datosEdicion.error);
                }

                return inicializarFormulario(modo, producto, datosEdicion);
            })
            .catch(error => console.log("Error: ", error));

    }

    // === MODO EDITAR ===

    if (modo === "editar") {
        console.log("modo editar...");
        datosEditables = localStorage.getItem("datosEditables");     //datosEditables es un object
        console.log(datosEditables);

        inicializarFormulario(modo, producto, datosEditables);

        debugger
    }

})