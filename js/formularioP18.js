document.addEventListener("DOMContentLoaded", function(){
    const btnRetroceder = document.getElementById("btnRetroceder");
    const displayProduccion = document.getElementById("displayProduccion");
    const producto = "P18"; 

    //Obtener la última producción de P18 acabada o en curso
    console.log("Obteniendo última producción de P18");
    const datos = new FormData();

    fetch("procesar.php", {
        method: "POST",
        body: datos
    })
    .then (response => response.json())
    .then (data => {
        const ultimoNumero = parseInt(data.ultimoNumero, 10); //Convertir el data a número entero

        if (isNaN(ultimoNumero)) {
            console.error("Respuesta inválida del servidor:", data);
            return;
        }

        window.numeroProduccion = ultimoNumero + 1;
        //let mezcladores;
        displayProduccion.innerHTML = numeroProduccion; //Mostramos el número de producción 
        console.log("Producción siguiente:", numeroProduccion);

        //Manejar los mezcladores
        const listaMezcladores = data.mezcladores;
        console.log("Mezcladores recibidos: ", listaMezcladores);                

        //Contenedor de mezcladores
        const contenedorMezcladores = document.querySelector("#mezcladores fieldset");

        //Crear dinámicamente los radios de mezcladores

        listaMezcladores.forEach((mezclador, index) => {
            const id = "mezclador_" + mezclador.Equipo_id;
            const input = document.createElement("input");
            input.type = "radio";
            input.name = "mezclador";
            input.id = id;
            input.value = mezclador.Equipo_id;
            
            const label = document.createElement("label");
            label.htmlFor = id;
            //label.textContent = mezclador.NombreEquipo;
            label.textContent = mezclador.Equipo_id;

            contenedorMezcladores.appendChild(input);
            contenedorMezcladores.appendChild(label);
            contenedorMezcladores.appendChild(document.createElement("br"));            
        });

        //Manejar los reactores
        const listaReactores = data.reactores;
        console.log("Reactores recibidos: ", listaReactores);

        //Contenedor de reactores
        const contenedorReactores = document.querySelector("#reactores fieldset");

        //Crear dinámicamente los radios de reactores
        listaReactores.forEach((reactor, index) => {
            const id = "reactor_" + reactor.Equipo_id;
            const input = document.createElement("input");
            input.type = "radio";
            input.name = "reactor";
            input.id = id;
            input.value = reactor.Equipo_id;

            const label = document.createElement("label");
            label.htmlFor = id;
            //label.textContent = reactor.NombreEquipo;
            label.textContent = reactor.Equipo_id;

            contenedorReactores.appendChild(input);
            contenedorReactores.appendChild(label);
            contenedorReactores.appendChild(document.createElement("br"));
        });


        //Manejar las recetas
        const listaRecetas = data.recetas;
        console.log("Recetas recibidas: ", listaRecetas);

        //Contenedor de recetas
        const contenedorRecetas = document.querySelector("#recetas fieldset");

        //Crear dinámicamente los radios de recetas
        listaRecetas.forEach((receta, index) => {
            const id = "R${index +1}_p18";
            //const id = receta.Receta_id;
            const input = document.createElement("input");
            input.type ="radio";
            input.name ="receta";
            input.id = id;
            input.value = receta.NombreReceta;

            const label = document.createElement("label");
            label.htmlFor = id;
            label.textContent = receta.NombreReceta;

            contenedorRecetas.appendChild(input);
            contenedorRecetas.appendChild(label);
            contenedorRecetas.appendChild(document.createElement("br"));

        });
        
    })    



    //Acción para el botón Retroceder
    btnRetroceder.addEventListener("click", function(){
        window.location.href="inicio.php";
    })
})