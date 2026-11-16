    <!DOCTYPE html>
    <html lang="es">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="css/styleHB10.css" rel="stylesheet" type="text/css">
        <title>Alta Basicidad</title>
    </head>

    <body>
        <div id="contenedor" class="contenedor">
            <div id="formulario">
                <div id="mezclador_M511">
                    <fieldset>
                        <legend>Mezclador M511</legend>
                        <div class="input-group-Mezcladores">
                            <label for="peso_inicial_M511" class="input-label">Peso inicial M411 (Kg):</label>
                            <input type="text" id="peso_inicial_M511" name="peso_inicial_M511">

                            <div id="peso_final" class="peso_final">
                                <label for="peso_agua_M511" class="input-label">Peso agua M411 (Kg):</label>
                                <input type="text" id="peso_agua_M511" name="peso_agua_M511">
                            </div>

                            <div class="input-group-Mezcladores">
                                <span class="input-label">Agua dosificada</span>
                                <label class="input-label">
                                    <input type="radio" id="chk_mezclador_ok_si" name="chk_mezclador_ok" value="1">
                                    Sí
                                </label>
                                <label class="input-label">
                                    <input type="radio" id="chk_mezclador_ok_no" name="chk_mezclador_ok" value="0" checked>
                                    No
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </div>
                <!--<div id="mezclador_M512">
                    <fieldset>
                        <legend>Mezclador M512</legend>
                        <div class="input-group-Mezcladores">
                            <label for="peso_inicial_M512" class="input-label">Peso inicial M512 (Kg):</label>
                            <input type="text" id="peso_inicial_M512" name="peso_inicial_M512">

                            <div id="peso_final" class="peso_final">
                                <label for="peso_total_M411" class="input-label">Peso agua M512 (Kg):</label>
                                <input type="text" id="peso_total_M512" name="peso_total_M512">
                            </div>

                            <div class="input-group-Mezcladores">
                                <label class="input-label">
                                    <input type="checkbox" id="chk_mezclador_ok" name="chk_mezclador_ok">
                                    Sacar carbonato cálcico dosificadas
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </div>-->
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