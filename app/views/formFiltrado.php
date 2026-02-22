<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="/HTML/public/css/styleFiltrado.css" rel="stylesheet" type="text/css">
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
            <fieldset><legend>Analítica</legend>
                <label>Densidad</label>
                <input id="densidad" class="densidad">
                <br><br><br>
                <label>Riqueza</label>
                <input id="riqueza" class="riqueza">
            </fieldset>
        </div>

        <div id="datosFiltrado">
            <fieldset><legend>Datos Filtrado</legend>
                <label>Volumen inicial</label>
                <input id="volumen_inicial" class="volumen_inicial">
                <br><br><br>
                <label>Volumen de agua</label>
                <input id="volumen:agua" class="volumen_agua">
            </fieldset>
        </div>

        <div id="depositos">
            <fieldset><legend>Depósitos</legend>
            </fieldset>
        </div>
    </div>

    <!-- NOTAS DEBAJO OCUPANDO EL ANCHO COMPLETO -->
    <div id="notas">
        <fieldset><legend>Notas</legend>
            <textarea id="notasTexto"></textarea>
        </fieldset>
    </div>

    <div id="botonera">
        <button id="btnRetroceder" class="btnRetroceder">Retroceder</button>
        <button id="btnFiltrar" class="btnFiltrar">Filtrar</button>
    </div>

    <div id="resultados" class="resultados">
        <p id="displayFiltrado" name="displayFiltrado"></p>
    </div>
</div>
    
  <!--  <div id="modal" class="mi-modal">
            <div class="mi-modal-contenido">
                <p id="modalMsg"></p>
                <button id="btnAceptar" class="mi-boton">Aceptar</button>
            </div>
        </div>        -->
    </div>     
    <script src="/html/public/js/formFiltrado.js"></script>
</body>
</html>