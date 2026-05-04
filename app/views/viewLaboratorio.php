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
                <input type="date" id="desde">
                <label>Hasta</label>
                <input type="date" id="hasta">
            </div>
            <!--<div id="analitica" class="analitica">
                <label>Analítica</label>
                <select id="filtroAnalitica">                    
                    <option value="0">Sin analítica</option>
                    <option value="1">Con analítica</option>
                </select>
            </div>-->            

            <div id="mostrar" class="mostrar">
                <label>Valor analítica</label>
                <select id="valor_min"></select>
                <select id="valor_max"></select>
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

    <div id="modalAnalitica" class="modal" style="display:none;">
        <div class="modal-contenido">
            <span id="cerrarModalAnalitica" class="cerrar">&times;</span>

            <h3>Registrar Analítica</h3>

            <form id="formAnalitica">
                <input type="hidden" id="productoAnalitica">
                <input type="hidden" id="fabricacionAnalitica">
                <input type="hidden" id="produccionesAnalitica">

                <div id="contenedorCamposAnalitica"></div>

                <button type="submit">Guardar</button>
            </form>
        </div>
    </div>

    <div id="producciones_sin_analitica" name="producciones_sin_analitica" class="producciones_sin_analitica">
        <table id="tabla" name="tabla" class="tabla">
            <tr>
                <th>Producto</th>
                <th>Nº Fabricación</th>
                <th>Fecha - Hora</th>
                <th>Estado</th>
                <th></th>
            </tr>
        </table>
    </div>
</body>
<script src="js/utils.js"></script>
<script src="js/Laboratorio.js"></script>

</html>