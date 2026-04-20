<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="css/styleHome.css" rel="stylesheet" type="text/css">
    <title>Index</title>
</head>

<body>
    <div name="botonera">
        <button id="btnP18" class="boton">P18</button>
        <button id="btnSulfato" class="boton">Sulfato</button>
        <button id="btnFerrico" class="boton">Férrico</button>
        <button id="btnHb10" class="boton">HB 10</button>        
        <!--<button id="btnFiltrado" class="boton">Filtrado</button>-->
    </div>

    <div id="producciones_en_curso" name="producciones_en_curso" class="producciones_en_curso" style="display:none">
        <table id="tabla" name="tabla" class="tabla"> </table>
    </div>

    <div id="displayM216" class="m216">
        <label>M216</label>
        <label id="label_m216"></label>
    </div>

</body>
<script>const ROL_USUARIO = "<?= isset($rol) ? $rol : '' ?>";</script>
<script src="js/home.js"></script>

</html>