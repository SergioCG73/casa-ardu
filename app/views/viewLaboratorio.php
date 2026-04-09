<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="css/styleLaboratorio.css" rel="stylesheet" type="text/css">
    <title>Vista Laboratorio</title>
</head>

<body>
    <div id="botonera">
        <button id="btnFiltrado" class="boton">Filtrado</button>
        <button id="btnSulfato" class="boton">Sulfato</button>
        <button id="btnFerrico" class="boton">Férrico</button>
        <button id="btnHB10" class="boton">HB 10</button>
    </div>

    <div id="formulario">
        <label>Fabricaciones: </label>
        <fieldset>
            <legend>Analítica P18</legend>
            <label>Densidad</label>
            <input type="text" id="densidad" class="densidad">
            <label>Riqueza</label>
            <input type="text" id="riqueza" class="riqueza">
        </fieldset>

        <div id="navegacion">
            <button id="btnAnterior" class="boton">Anterior</button>
            <button id="btnSiguiente" class="boton">Siguiente</button>
        </div>

        <button id="btnIngresar" class="boton">Ingresar</button>
    </div>

    <div id="modal" class="mi-modal">
        <div class="mi-modal-contenido">
            <p id="modalMsg"></p>
            <button id="btnAceptar" class="mi-boton">Aceptar</button>
        </div>
    </div>


</body>
<script src="js/Laboratorio.js"></script>

</html>