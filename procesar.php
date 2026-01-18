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

// Envio de datos a la tabla fab_en_curso
    //Verificar si los datos se recibieron desde AJAX
        
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recoger los datos enviados por AJAX
        $numFabricacion = $_POST['numProduccion'] ?? '';
        $mezclador = $_POST["mezclador"] ?? '';
        $receta = $_POST["receta"] ?? 0;
        $fechaHora = $_POST["fechaHora"] ?? '';



    // Preparar la consulta para insertar los datos en la base de datos
    if ($numProduccion && $descripcion && $cantidad) {
        $insertSQL = "INSERT INTO fab_en_curso (Fabricacion_id, FechaInicio, ) 
                      VALUES (:numProduccion, :descripcion, :cantidad)";

        $insertStmt = $conexion->prepare($insertSQL);
        $insertStmt->bindParam(':numProduccion', $numProduccion);
        $insertStmt->bindParam(':descripcion', $descripcion);
        $insertStmt->bindParam(':cantidad', $cantidad);

        // Ejecutar la inserción
        if ($insertStmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Datos guardados correctamente']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error al guardar los datos']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Faltan datos']);
    }




        
    }


