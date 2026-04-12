<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">    
    <link href="css/styleFerrico.css" rel="stylesheet" type="text/css">
    <title>Formulario Ferrico</title>
</head>
<body>
    <div id="contenedor" class="contenedor">
        <h1 id="titulo-formulario">Cloruro Férrico</h1>

        <div id="formulario">
            <div id="mezcladores">
                <fieldset>
                    <legend>Mezcladores</legend>
                    <div class="radio-group">
                        <label class="radio-label"><input type="radio" name="sel_mezclador" value="M1"> Mezclador 1</label>
                        <label class="radio-label"><input type="radio" name="sel_mezclador" value="M2"> Mezclador 2</label>
                    </div>

                    <div class="input-group-Mezcladores">
                        <label for="peso_inicial_mezclador" class="input-label">Peso inicial mezclador (Kg):</label>                    
                        <input type="text" id="peso_inicial_mezclador" name="peso_inicial_mezclador">

                        <div id="peso-final" class ="peso-final">
                            <label for="peso_final_mezclador" class="input-label">Peso final mezclador (Kg):</label>
                            <input type="text" id="peso_final_mezclador" name="peso_final_mezclador">
                        </div>                        
                    </div>
                </fieldset>
            </div>

            <div id="recetas">
                <fieldset>
                    <legend>Recetas</legend>
                    <div class="radio-group">
                        <label class="radio-label"><input type="radio" name="sel_receta" value="P18"> P18</label>
                        <label class="radio-label"><input type="radio" name="sel_receta" value="Papilla"> Papilla</label>
                    </div>                    
                </fieldset>
            </div>

            <div>
                <label>Sacas dosificadas:
                <input type="checkbox" class="sacas" name="sacas" value="1">
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
        
        <div id="modal" class="mi-modal">
            <div class="mi-modal-contenido">
                <p id="modalMsg"></p>
                <button id="btnAceptar" class="mi-boton">Aceptar</button>
            </div>
        </div>        
    </div>
    <script src="js/Ferrico.js"></script>
    <script src="js/utils.js"></script>
</body>
</html>