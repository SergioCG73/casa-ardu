<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">    
    <link href="/HTML/public/css/style.css" rel="stylesheet" type="text/css">
    <title>Formulario P18</title>
</head>
<body>
    <div id="contenedor" class="contenedor">
        <h1 id="titulo-formulario">Policloruro</h1>

        <div id="formulario">
            <div id="mezcladores">
                <fieldset>
                    <legend>Mezcladores</legend>
                    <div class="radio-group">
                        <label class="radio-label"><input type="radio" name="sel_mezclador" value="M1"> Mezclador 1</label>
                        <label class="radio-label"><input type="radio" name="sel_mezclador" value="M2"> Mezclador 2</label>
                    </div>

                    <div id="peso_inicial_mezcla">
                        <label for="peso_inicial_mezclador" class="input-label">Peso inicial mezclador (Kg):</label>                    
                        <input type="text" id="peso_inicial_mezclador" name="peso_inicial_mezclador">
                    </div>
                    
                    <div id="peso_final_mezcla">
                        <label for="peso_final_mezclador" class="input-label">Peso final mezclador (Kg):</label>
                        <input type="text" id="peso_final_mezclador" name="peso_final_mezclador">
                    </div>
                </fieldset>
            </div>

            <div id="reactores">
                <fieldset>
                    <legend>Reactores</legend>
                    <div class="radio-group">
                        <label class="radio-label"><input type="radio" name="sel_reactor" value="R1"> Reactor 1</label>
                        <label class="radio-label"><input type="radio" name="sel_reactor" value="R2"> Reactor 2</label>
                    </div>

                    <label for="peso_inicial_reactor" class="input-label">Peso inicial reactor (Kg):</label>
                    <input type="text" id="peso_inicial_reactor" name="peso_inicial_reactor"> 
                    
                    <label for="peso_final_reactor" class="input-label">Peso final reactor (Kg):</label>
                    <input type="text" id="peso_final_reactor" name="peso_final_reactor"> 
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

            <div id="botonera" class="botonera">
                <button id="btnRetroceder" name="btnRetroceder">Retroceder</button>                
                <button id="btnCrear" name="btnCrear">Crear</button>                
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
    
    <script src="/html/public/js/formp18.js"></script>
</body>
</html>