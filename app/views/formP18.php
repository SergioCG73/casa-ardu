<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">    
    <link href="/HTML/public/css/style.css" rel="stylesheet" type="text/css">
    <title >Formulario P18</title>
</head>
<body>
    <div id="contenedor" class="contenedor">
        <h1 id="titulo-formulario">Policloruro</h1>
        <div id="formulario" name="formulario">
            <div id="mezcladores" name="mezcladores">
                <fieldset><legend>Mezcladores</legend></fieldset>
                    <br><br><br>
                    <label for="peso_inicial_mezclador" class="input-label">Peso inicial mezclador (Kg):</label>
                    <input type="text" id="peso_inicial_mezclador" name="peso_inicial_mezclador">
                    <div id="peso_final_mezcla">
                        <br><br><br>
                        <label for="peso_final_mezclador" class="input-label">Peso final mezclador (Kg):</label>
                        <input type="text" id="peso_final_mezclador" name="peso_final_mezclador">
                    </div>
            </div>

            <div id="reactores" class="reactores">
                <fieldset><legend>Reactores</legend></fieldset>
                    <br><br><br>
                    <label for="peso_inicial_reactor" class="input-label">Peso inicial reactor (Kg):</label>
                    <input type="text" id="peso_inicial_reactor" name="peso_inicial_reactor"> 
                    <br><br><br>
                    <label for="peso_final_reactor" class="input-label">Peso final reactor (Kg):</label>
                    <input type="text" id="peso_final_reactor" name="peso_final_reactor"> 
            </div>

            <div id="recetas" class="recetas">
                <fieldset><legend>Recetas</legend></fieldset>
            </div>

            <div id="botonera" class="botonera">
                <button id="btnRetroceder" name="btnRetroceder">Retroceder</button>                
                <button id="btnCrear" name="btnCrear">Crear</button>                
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

    </div>    
    </div>
</body>    
    <script src="/html/public/js/formp18.js"></script>
</html>