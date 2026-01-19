<?php

//Este fichero recibe los datos enviados por AJAX desde index.js y los inserta en la tabla fab_en_curso

// Envio de datos a la tabla fabricaciones_en_curso
    //Verificar si los datos se recibieron desde AJAX    
        
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {        
    // Recoger los datos enviados por AJAX

        require_once("miconexion.php");
        $fechaHora = $_POST["fechaHora"] ?? '';        
        $mezclador = $_POST["mezclador"] ?? '';
        $receta = $_POST["receta"] ?? 0;
        $numFabricacion = $_POST['numFabricacion'] ?? '';
        $producto = $_POST['producto'] ?? '';
       
       /* $respuesta = [
            "ok" => true,
            "datos" => $_POST
        ];

         header('Content-Type: application/json');
         echo json_encode($respuesta);         */

    //Validación de datos recibidos

    if (
    empty($fechaHora) ||
    empty($mezclador) ||
    empty($receta) ||
    empty($numFabricacion) ||
    empty($producto)
    ) {
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false,
        'message' => 'Faltan datos'
    ]);
    exit;
    }

    try {
        $insertSQL = "
        INSERT INTO fabricaciones_en_curso 
        (FechaInicio, Mezclador, Receta, NumeroFabricacion, Producto_id) 
        VALUES (:fechaHora, :mezclador, :receta, :numFabricacion, :producto)
        ";

    $insertStmt = $conexion->prepare($insertSQL);
    $insertStmt->bindParam(':fechaHora', $fechaHora, PDO::PARAM_STR);
    $insertStmt->bindParam(':mezclador', $mezclador, PDO::PARAM_STR);
    $insertStmt->bindParam(':receta', $receta, PDO::PARAM_STR);
    $insertStmt->bindParam(':numFabricacion', $numFabricacion, PDO::PARAM_STR);
    $insertStmt->bindParam(':producto', $producto, PDO::PARAM_STR);

    $insertStmt->execute();

    header('Content-Type: application/json');
    echo json_encode([
        'ok' => true,
        'message' => 'Datos guardados correctamente'
    ]);
    exit;

} catch (PDOException $e) {

    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
    exit;
}
    }      
 
?>
