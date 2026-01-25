document.addEventListener("DOMContentLoaded", function()
{
    const btnP18 = document.getElementById("btnP18");   
    const div_producciones_en_curso = document.getElementById("producciones_en_curso");
    const tabla = document.getElementById("tabla");

    btnP18.addEventListener("click", function(){
        localStorage.removeItem("editarP18");
        localStorage.setItem("modoP18", "crear");
        window.location.href="formularioP18.html";
    });


    //Cargar producciones en curso

    fetch("procesar.php")
        .then(response => response.json())
        .then(data => {
            if (!data.ok) return;

            //Mostrar el div
            div_producciones_en_curso.style.display = "block";

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
            data.producciones_en_curso.forEach(p =>{ //Luego se transforma en this.dataset.info
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
                    </tr> 
                    `;
                    tabla.innerHTML = html;

                    document.querySelectorAll(".btnEditar").forEach(btn => {
                        btn.addEventListener("click", function() {
                            //Recuperar datos de la fila
                            const datos = JSON.parse(this.dataset.info);
                            //Guardarlos en localStorage
                            localStorage.setItem("editarP18", JSON.stringify(datos));

                            //Redirigir al formulario
                            window.location.href ="formularioP18.html";
                        })
                    })

                    div_producciones_en_curso.style.display = "block";
            })           
            
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

            
            document.querySelector('.icono-borrar').addEventListener('click', function() {
                console.log("Borrar pulsado");
            });
            });    
});