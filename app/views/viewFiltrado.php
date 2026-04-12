<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="css/styleFiltrado.css" rel="stylesheet" type="text/css">
    <title>FiltradoP18</title>
</head>

<body>
    <div id="contenedor" class="contenedor">
        <h1 id="titulo-formulario">Filtrado Policloruro</h1>
        <div id="fabricaciones">
            <h2></h2>
        </div>
        <div id="fila-superior">
            <div id="analitica">
                <fieldset>
                    <legend>Analítica</legend>
                    <label>Densidad</label>
                    <input id="densidad" class="densidad">
                    <br><br><br>
                    <label>Riqueza</label>
                    <input id="riqueza" class="riqueza">
                </fieldset>
            </div>

            <div id="datosFiltrado">
                <fieldset>
                    <legend>Datos Filtrado</legend>
                    <label>Volumen inicial</label>
                    <input id="volumen_inicial" class="volumen_inicial">
                    <br><br><br>
                    <label>Volumen de agua</label>
                    <input id="volumen_agua" class="volumen_agua">                    
                    <label id="label-restos">Restos</label>
                    <input id="input-restos" class="input-restos">                    
                </fieldset>
            </div>

            <div id="depositos">
                <fieldset>
                    <legend>Depósitos</legend>
                </fieldset>
            </div>

            <div id="notas" class="notas">
                <fieldset>
                    <legend>Notas</legend>
                    <textarea id="txtnotas"></textarea>
                </fieldset>
            </div>
        </div>

        <div id="botonera">
            <button id="btnRetroceder" class="btnRetroceder">Retroceder</button>
            <button id="btnFiltrar" class="btnFiltrar">Filtrar</button>
        </div>

        <div id="resultados" class="resultados">
            <p id="displayFiltrado" name="displayFiltrado"></p>
        </div>

        <div id="modal" class="mi-modal">
            <div class="mi-modal-contenido">
                <p id="modalMsg"></p>
                <button id="btnAceptar" class="mi-boton">Aceptar</button>
            </div>
        </div>
    </div>
    <script src="js/Filtrado.js"></script>
    <script src="js/utils.js"></script>
</body>

</html>
