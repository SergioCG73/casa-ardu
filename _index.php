<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="css/style.css" rel="stylesheet" type="text/css">
    <title>Document</title>
</head>
<body>
    <div name="botonera">
        <button id="btnP18" name="btnP18">P18</button>
    </div>    

    <div id="mezcladores">
        <fieldset><legend>Mezcladores</legend>
            <input type="radio" id="m214" name="mezclador" value="M214">
            <label for="m214">Mezclador M214</label><br>
            <input type="radio" id="m215" name="mezclador" value="M215">
            <label for="m215" >Mezclador M215</label><br>
        </fieldset>        
    </div>  
    
    <div id="recetas">
        <fieldset><legend>Recetas</legend>
            <input type="radio" id="receta_1" name="recetas" value="Receta 1">
            <label for="receta_1">Receta 1</label><br>
            <input type="radio" id="receta_2" name="recetas" value="Receta 2">
            <label for="receta_2" >Receta 2</label><br> 
            <input type="radio" id="receta_3" name="recetas" value="Receta 3">
            <label for="receta_3" >Receta 3</label><br>     
            <input type="radio" id="receta_4" name="recetas" value="Receta 4">
            <label for="receta_4" >Receta 4</label><br>
        </fieldset>
    </div>

    <div id="pesos">
        <label for="peso_inicial">Peso Inicial: </label>
        <input type="text" id="peso_inicial" name="peso_inicial">
    </div>

    <p id="numeroproduccion"></p>

    <div name="botonera">
        <button id="btnValidar" name="btnValidar">Validar</button>
        <p id="resultado"></p>   
        <input type="hidden" id="fechaHora" name="fechaHora">     
    </div>

    <!--<div name="numeroproduccion">
        <label for="num_produccion">Nº de Producción: </label>
        <input type="text" id="num_produccion" name="num_produccion">
    </div>-->
    
</body>
    <script src="js/index.js"></script>
</html>