<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">    
    <link href="css/styleSulfato.css" rel="stylesheet" type="text/css">
    <title>FormularioSulfato</title>
</head>
<body>
    <div id="contenedor" class="contenedor">
        <h1 id="titulo-formulario">Sulfato Alumina</h1>

        <div id="formulario" name="formulario">            
            <div id="reactores" class="reactores">
                <fieldset>
                    <legend>Reactores</legend>

                    <label for="peso_inicial_reactor" class="input-label">Peso inicial reactor (Kg):</label>
                    <input type="text" id="peso_inicial_reactor" name="peso_inicial_reactor"> 
                    
                    <div id="contenedor_peso_final" class="peso_final">
                        <label for="peso_final_reactor" class="input-label">Peso final reactor (Kg):</label>
                        <input type="text" id="peso_final_reactor" name="peso_final_reactor"> 
                    </div>
                </fieldset>
            </div>

            <div id="recetas" class="recetas">
                <fieldset>
                    <legend>Recetas</legend>
                </fieldset>
            </div>

            <div id="notas" class="notas">
                <fieldset>
                    <legend>Notas</legend>
                    <textarea id="txtnotas"></textarea>
                </fieldset>
            </div>

            <div id="botonera" class="botonera">
                <button id="btnRetroceder" class="boton">Retroceder</button>                
                <button id="btnCrear" class="boton">Crear</button>                
            </div>
        </div>

        <div id="resultados" class="resultados">
            <p id="displayProduccion" name="displayProduccion"></p>
        </div>
        
        <div id="modal" class="mi-modal" hidden>
            <div class="mi-modal-contenido">
                <p id="modalMsg"></p>
                <button id="btnAceptar" class="mi-boton">Aceptar</button>
            </div>
        </div>

    </div> 
    <script src="js/utils.js"></script>
    <script src="js/Sulfato.js"></script>
</body>
</html>
