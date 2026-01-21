<?php

require_once("miconexion.php");

$numProduccion = $_POST['num_produccion'] ?? '';

// Preparar la consulta para obtener la última producción terminada
$sql = "SELECT NumeroFabricacion 
        FROM p18_terminadas 
        ORDER BY NumeroFabricacion DESC 
        LIMIT 1";

$stmt = $conexion->prepare($sql);

// Ejecutar
$stmt->execute();

$ultimoNumero = $stmt->fetchColumn(); // devuelve directamente el valor de la primera columna


//Prepara la consulata para obtener la última producción en curso

$sql="SELECT NumeroFabricacion
      FROM fabricaciones_en_curso
      WHERE Producto_id = 'P18'
      ORDER BY NumeroFabricacion DESC
      LIMIT 1";

$stmt = $conexion->prepare($sql);
$stmt->execute();

$ultimoNumero_fab_en_curso = $stmt->fetchColumn();

$ultimoNumero = max($ultimoNumero, $ultimoNumero_fab_en_curso);

//Preparar la consulta para obtener los mezcladores vacíos de P18.

$sql = "SELECT Equipo_id, NombreEquipo 
        FROM equipos 
        WHERE Tipo ='Mezclador' AND Estado = 'Vacio' AND ProductoFabricado = 'P18'";

$stmt = $conexion -> prepare($sql);
$stmt ->execute();
$mezcladores = $stmt ->fetchAll(PDO::FETCH_ASSOC);
    
//Preparar consulta para obtener los reactores vacíos de P18.

$sql = "SELECT Equipo_id, NombreEquipo
        FROM equipos
        WHERE Tipo = 'Reactor' AND ProductoFabricado = 'P18'";

$stmt = $conexion -> prepare($sql);
$stmt -> execute();
$reactores = $stmt -> fetchAll(PDO::FETCH_ASSOC);

//Preparar consulta para obtener las recetas

$sql = "SELECT Receta_id, NombreReceta
        FROM recetas
        WHERE ProductoFabricado = 'P18' AND Estado = 'En uso'";

$stmt = $conexion -> prepare($sql);
$stmt -> execute();
$recetas = $stmt -> fetchAll(PDO::FETCH_ASSOC);       
       

echo json_encode([
    "ultimoNumero" => $ultimoNumero,
    "mezcladores" => $mezcladores,
    "reactores" => $reactores,
    "recetas" => $recetas
]);
        




        
    


