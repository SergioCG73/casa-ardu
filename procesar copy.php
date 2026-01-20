<?php

require_once("miconexion.php");

$numProduccion = $_POST['num_produccion'] ?? '';

// Preparar la consulta
$sql = "SELECT NumeroFabricacion 
        FROM p18_terminadas 
        ORDER BY NumeroFabricacion DESC 
        LIMIT 1";

$stmt = $conexion->prepare($sql);

// Ejecutar
$stmt->execute();

$ultimoNumero = $stmt->fetchColumn(); // devuelve directamente el valor de la primera columna

// Obtenemos el resultado con store_result + bind_result

if ($ultimoNumero !== false) {
    //echo "Última producción registrada: $ultimoNumero";    
    //$numProduccion = $ultimoNumero + 1;    
    echo $ultimoNumero;
    
} else {
    //echo "No hay producciones registradas";
    echo 0;
}


//Preparar la consulta para obtener los mezcladores vacíos de P18.

$sql = "SELECT Equipo_id, NombreEquipo 
        FROM equipos 
        WHERE Tipo ='Mezclador' AND Estado = 'Vacio' AND ProductoFabricado = 'P18'";

$stmt = $conexion -> prepare($sql);
$stmt ->execute();
$mezcladores = $stmt ->fetchAll();
echo json_encode($mezcladores);





        
    


