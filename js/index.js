document.addEventListener("DOMContentLoaded", function() {
    const div_mezcladores = document.getElementById("mezcladores");
    const div_recetas = document.getElementById("recetas");
    const div_pesos = document.getElementById("pesos");
    const btnP18 = document.getElementById("btnP18");
    const btnValidar = document.getElementById("btnValidar"); 
    const peso_inicial_input = document.getElementById("peso_inicial");
    const displayProduccion = document.getElementById("numeroproduccion");
    let mezcladorSeleccionado = null;
    let recetaSeleccionada = null;
    
    div_mezcladores.style.display = "none";
    div_recetas.style.display = "none";
    div_pesos.style.display = "none";        
    btnValidar.style.display = "none";    

    btnP18.addEventListener("click",function(){
        if (div_mezcladores.style.display==="none") {
            div_mezcladores.style.display="block";
        }

        if (div_recetas.style.display==="none") {
            div_recetas.style.display="block";
        }

        if (div_pesos.style.display==="none") {
            div_pesos.style.display="block";
        } 

        if (btnValidar.style.display==="none") {
            btnValidar.style.display="block";
        }

        //Obtener la última producción de P18 terminada        
        console.log("Obteniendo último número de producción...");
        const datos = new FormData();                

        fetch("procesar.php", {
            method: "POST",
            body: datos
            })
            .then(response => response.text())
            .then(data => {
                //console.log("Respuesta del servidor:", data)
                const ultimoNumero = parseInt(data, 10); //Convertir a número entero

                if (isNaN(ultimoNumero)) {
                    console.error("Respuesta inválida del servidor:", data);
                    return;
                }   

                window.numeroProduccion = ultimoNumero + 1;
                displayProduccion.innerHTML = numeroProduccion;
                //console.log("Número de producción siguiente:", numeroProduccion);
                //document.getElementById("numeroproduccion").innerHTML = numeroProduccion;                
            })
            .catch(error => {
                console.error(error);
            });
    })   

    // Agregar event listeners a los radio buttons de mezcladores y recetas
    document.querySelectorAll('input[name="mezclador"]').forEach(radio => {
    radio.addEventListener('change', function () {
        console.log("Mezclador seleccionado:", this.value);
        mezcladorSeleccionado = this.value;
    });
    });

    document.querySelectorAll('input[name="recetas"]').forEach(radio => {
    radio.addEventListener('change', function () {
        console.log("Receta seleccionada:", this.value);
        recetaSeleccionada = this.value;
    });
    });

    // Capturar el valor del peso inicial
    peso_inicial_input.addEventListener("input", function() {
        // Quitar todo lo que no sea un número
        let valor = this.value.replace(/\D/g, "");
        // Formatear con separador de miles
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        // Asignar el valor formateado al input
        this.value = valor;
        console.log("Peso inicial:", valor);
    });
    
    // Acciones validar button
    document.getElementById("btnValidar").addEventListener("click", function() {
        const ahora = new Date();
        //Formato YYYY-MM-DD HH:MM:SS (ideal para MySQL)
        const fechaHora =
            ahora.getFullYear() + "-" +
            String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
            String(ahora.getDate()).padStart(2, '0') + " " +
            String(ahora.getHours()).padStart(2, '0') + ":" +
            String(ahora.getMinutes()).padStart(2, '0') + ":" +
            String(ahora.getSeconds()).padStart(2, '0');

        //Mostrar en pantalla
        document.getElementById("resultado").innerText = "Validado el: " + fechaHora;

        //Guardar para el envío posterior
        /*document.getElementById("fechaHora").value = fechaHora;
        console.log(fechaHora);
        console.log(mezcladorSeleccionado);
        console.log(recetaSeleccionada);   
        console.log("Nº Produccion:", numeroProduccion);*/

         //Enviar datos a la tabla fab_en_curso

         // Enviar los datos del formulario mediante AJAX

            // Preparar los datos para enviar por AJAX
            const data = new FormData();
            data.append("fechaHora", fechaHora);
            data.append("mezclador", mezcladorSeleccionado);
            data.append("receta", recetaSeleccionada);
            data.append("numFabricacion", numeroProduccion);

            // Realizar la solicitud AJAX
            fetch('procesar.php', {
                method: 'POST',
                body: data
            })
            .then(response => response.json())
            .then(responseData => {
                alert(responseData.message);
                if (responseData.status === 'success') {
                    // Si los datos fueron guardados correctamente, actualizamos el último número
                    document.getElementById('ultimoNumero').textContent = numProduccion;
                }
            })
            .catch(error => console.log('Error al enviar los datos:', error));








        });    

       
       
});