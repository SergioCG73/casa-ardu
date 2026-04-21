<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="css/styleLaboratorio.css" rel="stylesheet" type="text/css">
    <title>Laboratorio</title>
</head>

<body>
    <h1>Laboratorio</h1>
    <div id="filtros" class="filtros">
        <fieldset>
            <legend>Filtro</legend>
            <div id="productos" class="productos"></div>
            <div id="fechas" class="fechas">
                <label>Desde </label>
                <input type="date" id = "desde">
                <label>Hasta</label>
                <input type="date" id = "hasta">
            </div>
            <div id="mostrar" class="mostrar">
                <label>Mostrar</label>
                <select id="cantidad"></select>
            </div>
            <div id="botonera">
                <button ID="btnBuscar" class="btnBuscar">Buscar</button>
            </div>
        </fieldset>
    </div>

    <div id="tabla" class="tabla"></div>
</body>
<script src="js/utils.js"></script>
<script src="js/Laboratorio.js"></script>

</html>