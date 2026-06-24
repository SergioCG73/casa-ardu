    <!DOCTYPE html>
    <html lang="es">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alta Basicidad</title>
    </head>

    <body>
        <h2>EN CONSTRUCCIÓN</h2>
        <div id="contenedor" class="contenedor">
            <div id="formulario">
                <div id="mezclador_M411">
                    <fieldset>
                        <legend>Mezclador M411</legend>
                        <div class="input-group-Mezcladores">
                            <label for="peso_inicial_M411" class="input-label">Peso inicial M411 (Kg):</label>
                            <input type="text" id="peso_inicial_M411" name="peso_inicial_M411">

                            <div id="peso_final" class="peso_final">
                                <label for="peso_agua_M411" class="input-label">Peso agua M411 (Kg):</label>
                                <input type="text" id="peso_agua_M411" name="peso_agua_M411">
                            </div>

                            <div class="input-group-Mezcladores">
                                <label class="input-label">
                                    <input type="checkbox" id="chk_mezclador_ok" name="chk_mezclador_ok">
                                    Agua dosificada
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </div>
                <div id="botonera" class="botonera">
                    <button id="btnRetroceder" class="boton">Retroceder</button>
                    <button id="btnCrear" class="boton">Crear</button>
                </div>

                <div id="resultados" class="resultados">
                    <p id="displayProduccion" name="displayProduccion"></p>
                </div>
            </div>
            <script src="js/Hb10.js"></script>
            <script src="js/utils.js"></script>
    </body>


    </html>