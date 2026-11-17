    <!DOCTYPE html>
    <html lang="es">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="css/styleHB10.css" rel="stylesheet" type="text/css">
        <title>Alta Basicidad</title>
    </head>

    <body>

        <div class="container">
            <header>
                <h1>Producción HB10</h1>
                <p>Registro y control del proceso de fabricación</p>
            </header>

            <form id="formProduccionHB10"
                action="guardar_hb10.php"
                method="POST">

                <!-- DATOS GENERALES -->
                <fieldset>
                    <legend>Datos generales</legend>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="lote">Número de lote</label>
                            <input type="text"
                                id="lote"
                                name="lote"
                                required>
                        </div>
                        <div class="form-group">
                            <label for="fecha">Fecha de fabricación</label>
                            <input type="date"
                                id="fecha"
                                name="fecha"
                                required>
                        </div>
                        <!--<div class="form-group full-width">
                            <label for="operario">Operario</label>
                            <input type="text"
                                id="operario"
                                name="operario"
                                required>
                        </div>-->
                        <div class="form-group full-width">
                            <label for="operario">Operario</label>
                            <select id="operario"
                                name="operario"
                                required>
                            </select>
                        </div>
                    </div>
                </fieldset>
                <!-- MEZCLADOR M511 -->
                <fieldset id="fieldsetM511">
                    <legend>Mezclador M511</legend>
                    <p class="section-description">
                        Dosificación de agua y carbonato cálcico.
                    </p>

                    <div class="subsection">
                        <h3>Control de pesos</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="m511_peso_inicial">
                                    Peso inicial
                                    <span class="unit">(kg)</span>
                                </label>
                                <input type="number"
                                    step="0.01"
                                    id="m511_peso_inicial"
                                    name="m511_peso_inicial">
                            </div>
                            <div class="form-group">
                                <label for="m511_peso_final">
                                    Peso final
                                    <span class="unit">(kg)</span>
                                </label>
                                <input type="number"
                                    step="0.01"
                                    id="m511_peso_final"
                                    name="m511_peso_final">
                            </div>
                        </div>
                    </div>

                    <div class="subsection">
                        <h3>Dosificación de materias primas</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="m511_agua_kg">
                                    Cantidad de agua
                                    <span class="unit">(kg)</span>
                                </label>
                                <input type="number"
                                    step="0.01"
                                    min="0"
                                    id="m511_agua_kg"
                                    name="m511_agua_kg">
                            </div>

                            <div class="form-group">
                                <label for="m511_carbonato_kg">
                                    Carbonato cálcico
                                    <span class="unit">(kg)</span>
                                </label>
                                <input type="number"
                                    step="0.01"
                                    min="0"
                                    id="m511_carbonato_kg"
                                    name="m511_carbonato_kg"
                                    value="2000">
                            </div>
                        </div>

                        <div class="checkbox-group" style="margin-top:18px">
                            <label class="checkbox-item">
                                <input type="checkbox"
                                    id="m511_agua_dosificada"
                                    name="m511_agua_dosificada"
                                    value="1">
                                Agua dosificada
                            </label>

                            <label class="checkbox-item">
                                <input type="checkbox"
                                    id="m511_carbonato_dosificado"
                                    name="m511_carbonato_dosificado"
                                    value="1">
                                2 sacas de carbonato cálcico dosificadas
                            </label>
                        </div>
                    </div>

                    <div class="subsection">
                        <h3>Finalización de M511</h3>

                        <div class="checkbox-group">

                            <label class="checkbox-item">
                                <input type="checkbox"
                                    id="m511_preparado"
                                    name="m511_preparado"
                                    value="1">
                                Mezcla M511 preparada
                            </label>
                        </div>
                    </div>
                </fieldset>
                <!-- MEZCLADOR M512 -->
                <fieldset id="fieldsetM512">
                    <legend>Mezclador M512</legend>
                    <p class="section-description">
                        Dosificación de P18, calentamiento y recepción de M511.
                    </p>

                    <div class="subsection">
                        <h3>Control de pesos</h3>
                        <div class="form-grid">

                            <div class="form-group">
                                <label for="m512_peso_inicial">
                                    Peso inicial
                                    <span class="unit">(kg)</span>
                                </label>

                                <input type="number"
                                    step="0.01"
                                    id="m512_peso_inicial"
                                    name="m512_peso_inicial">
                            </div>

                            <div class="form-group">
                                <label for="m512_peso_final">
                                    Peso final
                                    <span class="unit">(kg)</span>
                                </label>

                                <input type="number"
                                    step="0.01"
                                    id="m512_peso_final"
                                    name="m512_peso_final">
                            </div>

                        </div>

                    </div>

                    <div class="subsection">

                        <h3>Dosificación de materias primas</h3>

                        <div class="form-group">
                            <label for="m512_p18_kg">
                                Cantidad de P18
                                <span class="unit">(kg)</span>
                            </label>

                            <input type="number"
                                step="0.01"
                                min="0"
                                id="m512_p18_kg"
                                name="m512_p18_kg">
                        </div>

                        <div class="checkbox-group" style="margin-top:18px">

                            <label class="checkbox-item">
                                <input type="checkbox"
                                    id="m512_p18_dosificado"
                                    name="m512_p18_dosificado"
                                    value="1">
                                P18 dosificado
                            </label>

                        </div>

                    </div>

                    <div class="subsection">
                        <h3>Control de temperaturas y transferencia</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="m512_temp_80">
                                    Temperatura alcanzada
                                    <span class="unit">(ºC)</span>
                                </label>
                                <input type="number"
                                    step="0.1"
                                    id="m512_temp_80"
                                    name="m512_temp_80"
                                    placeholder="80">
                            </div>

                            <div class="form-group">
                                <label class="checkbox-item">
                                    <input type="checkbox"
                                        id="m512_temp_80_ok"
                                        name="m512_temp_80_ok"
                                        value="1">
                                    Se han alcanzado 80 ºC
                                </label>
                            </div>
                        </div>

                        <div class="checkbox-group" style="margin-top:18px">
                            <label class="checkbox-item">
                                <input type="checkbox"
                                    id="m512_transferencia"
                                    name="m512_transferencia"
                                    value="1">
                                Transferencia de M511 a M512 realizada
                            </label>
                        </div>

                        <div class="form-grid" style="margin-top:18px">

                            <div class="form-group">
                                <label for="m512_temp_60">
                                    Temperatura alcanzada
                                    <span class="unit">(ºC)</span>
                                </label>

                                <input type="number"
                                    step="0.1"
                                    id="m512_temp_60"
                                    name="m512_temp_60"
                                    placeholder="60">
                            </div>

                            <div class="form-group">
                                <label class="checkbox-item">
                                    <input type="checkbox"
                                        id="m512_temp_60_ok"
                                        name="m512_temp_60_ok"
                                        value="1">
                                    Se han alcanzado 60 ºC
                                </label>
                            </div>

                        </div>

                    </div>

                </fieldset>


                <!-- HOMOGENEIZACION Y FILTRACION -->

                <fieldset id="fieldsetProcesoFinal">
                    <legend>Homogeneización y filtración</legend>
                    <div class="subsection">
                        <h3>Homogeneización</h3>
                        <div class="form-grid">

                            <div class="form-group">
                                <label for="homogeneizacion_min">
                                    Tiempo de homogeneización
                                    <span class="unit">(minutos)</span>
                                </label>

                                <input type="number"
                                    id="homogeneizacion_min"
                                    name="homogeneizacion_min"
                                    min="0"
                                    value="180">
                            </div>

                        </div>

                        <div class="checkbox-group" style="margin-top:18px">

                            <label class="checkbox-item">
                                <input type="checkbox"
                                    id="homogeneizacion_finalizada"
                                    name="homogeneizacion_finalizada"
                                    value="1">
                                Homogeneización finalizada
                            </label>

                        </div>

                    </div>

                    <div class="subsection">

                        <h3>Dosificación de zeolita</h3>

                        <div class="form-grid">

                            <div class="form-group">
                                <label for="zeolita_kg">
                                    Cantidad de zeolita
                                    <span class="unit">(kg)</span>
                                </label>

                                <input type="number"
                                    step="0.01"
                                    min="0"
                                    id="zeolita_kg"
                                    name="zeolita_kg">
                            </div>

                            <div class="form-group">
                                <label for="zeolita_sacos">
                                    Número de sacos
                                </label>

                                <input type="number"
                                    min="0"
                                    id="zeolita_sacos"
                                    name="zeolita_sacos"
                                    value="5">
                            </div>

                        </div>

                        <div class="checkbox-group" style="margin-top:18px">

                            <label class="checkbox-item">
                                <input type="checkbox"
                                    id="zeolita_dosificada"
                                    name="zeolita_dosificada"
                                    value="1">
                                Zeolita dosificada
                            </label>

                        </div>

                    </div>

                </fieldset>


                <!-- OBSERVACIONES -->
                <fieldset>
                    <legend>Observaciones</legend>
                    <div class="form-group">
                        <label for="observaciones">
                            Incidencias y comentarios del proceso
                        </label>
                        <textarea id="observaciones"
                            name="observaciones"
                            rows="4"></textarea>
                    </div>
                </fieldset>

                <!-- BOTONES -->
                <div class="buttons">
                    <button type="submit" class="btn-save">
                        Guardar producción
                    </button>
                    <button type="reset" class="btn-reset">
                        Limpiar formulario
                    </button>
                    <button type="submit" class="btn-back">
                        Volver
                    </button>
                </div>
            </form>
        </div>
        <script src="js/utils.js"></script>
        <script src="js/Hb10.js"></script>

    </html>